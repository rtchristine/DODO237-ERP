// ============================================================
// utils/quote-parser.ts
// 인스나라 / 아이코원 Ctrl+A 텍스트 → ERP 필드 자동 파싱
// ============================================================

import { ParsedInfo, ParsedCoverage, ParsedInsurer, ParseResult } from '../types/parser';

// ── 보험사 ID ↔ 이름 매핑
const INS_MAP: [string, string][] = [
  ['meritz', '메리츠'], ['heungkuk', '흥국'], ['hyundai', '현대'],
  ['samsung', '삼성'],  ['hanhwa', '한화'],   ['hana', '하나'],
  ['lotte', '롯데'],    ['db', 'DB'],         ['kb', 'KB'], ['mg', 'MG'],
];
const INS_NAMES: Record<string, string> = Object.fromEntries(INS_MAP);

// ── 10원 단위 절삭
function trunc10(n: number): number {
  return Math.floor(n / 10) * 10;
}

// ── 소스 자동 감지
function detectSource(txt: string): 'icowon' | 'insnara' {
  if (txt.includes('CM보험료') || txt.includes('TM보험료')) return 'insnara';
  if (txt.includes('담보사항') && txt.includes('총금액'))    return 'icowon';
  return 'insnara';
}

// ── 고객/차량 공통 정보 파싱
function parseInfo(txt: string): ParsedInfo {
  const info: ParsedInfo = {};

  // 고객명: 주민번호 패턴 앞
  const nameM = txt.match(/([가-힣]{2,5})\s*[\(（]\d{6}\s*-\s*[\d*]{7}[\)）]/);
  if (nameM) {
    info.name = nameM[1];
  } else {
    const fallbackM = txt.match(/(?:피보험자|계약자|성명)\s*[:：]?\s*([가-힣]{2,10})/);
    if (fallbackM) info.name = fallbackM[1];
  }

  // 보험기간
  const directM = txt.match(/보험기간[\(（](\d{4}-\d{2}-\d{2})~(\d{4}-\d{2}-\d{2})[\)）]/);
  const rangeM  = txt.match(/(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})/);
  const joinM   = txt.match(/가입예정일[\(（](\d{4}-\d{2}-\d{2})[\)）]/);

  if (directM) {
    info.startDate = directM[1];
    info.period    = `${directM[1]}~${directM[2]}`;
  } else if (rangeM) {
    info.startDate = rangeM[1];
    info.period    = `${rangeM[1]}~${rangeM[2]}`;
  } else if (joinM) {
    const [y, m, d] = joinM[1].split('-');
    const endYear   = String(parseInt(y) + 1);
    info.startDate  = joinM[1];
    info.period     = `${joinM[1]}~${endYear}-${m}-${d}`;
  }

  // 차량번호 (앞 0 제거)
  const carnoPatterns = [
    /차량번호\s*[:：]\s*0*([1-9]\d{1,2}[가-힣]\d{4})/,
    /(?:자동차사항|차량번호)[\s\t:]*0*([1-9]\d{1,2}[가-힣]\d{4})/,
    /\b0*([1-9]\d{1,2}[가-힣]\d{4})\b/,
  ];
  for (const pat of carnoPatterns) {
    const m = txt.match(pat);
    if (m) { info.carno = m[1]; break; }
  }

  // 연식
  const yearM = txt.match(/(\d{4})[A-Za-z가-힣]?년식/);
  if (yearM) info.year = yearM[1];

  // 차명
  const carM1 = txt.match(/코드\s*:\s*\S+(?:\t|\s{2,})([\w\s가-힣\.\(\)\/\-,]+?)(?:\t|\s{2,})(?:중형|소형|대형|승용|화물)/);
  const carM2 = txt.match(/차명\s*[:：]\s*([^\nㆍ·•\r]+)/);
  if (carM1)      info.carname = carM1[1].trim();
  else if (carM2) info.carname = carM2[1].trim().replace(/\s{2,}/g, ' ');

  // 차량가액
  const priceM = txt.match(/차량가액[^\d]*(\d[\d,]*)\s*만원/);
  if (priceM) info.carPrice = priceM[1].replace(/,/g, '') + '만원';

  // 용도
  const usageM = txt.match(/(개인용|업무용)/);
  if (usageM) info.usage = usageM[1];

  // 납입방법
  const payM = txt.match(/([가-힣]{2,4}납)\s/);
  if (payM) info.payMethod = payM[1];

  // 전가입사
  const PREV_KW = [
    '삼성화재','현대해상','DB손해보험','KB손해보험','한화손해보험',
    '흥국화재','메리츠화재','하나손해보험','롯데손해보험','MG손해보험',
  ];
  const prevRe = /(?:전보험사|전계약사)\s*:\s*([^\n\r]+)/g;
  let pm: RegExpExecArray | null;
  while ((pm = prevRe.exec(txt)) !== null) {
    const val = pm[1].trim();
    if (!val || val === '()' || val === '( )') continue;
    const found = PREV_KW.find(kw => val.includes(kw));
    if (found) { info.prev = found; break; }
  }

  // 할인할증등급
  const gradeM = txt.match(/할인할증(?:등급|율)\s*[:：]?\s*(\d+[ZzPp]?F?)/);
  if (gradeM) info.discGrade = gradeM[1];

  // 운전범위
  const DRIVE_KW = '부부\\+자녀|부부한정|부부\\+1인|가족한정|가족|누구나운전|누구나|기명1인한정|1인한정|임직원한정|자녀한정';
  const driveM = txt.match(new RegExp(`(?:운전자?범위)[\\s:：\\t]*(${DRIVE_KW})`))
              || txt.match(new RegExp(`(${DRIVE_KW})`));
  if (driveM) info.drive = driveM[1];

  // 연령한정
  const ageM = txt.match(/연령한정특약(만\d+세이상|전연령)/)
            || txt.match(/연령특약[\s\t]*(\d+세이상)/)
            || txt.match(/(만\d+세이상|전연령|\d+세이상)/);
  if (ageM) {
    let age = ageM[1];
    if (!age.startsWith('만')) age = '만' + age;
    info.age = age;
  }

  // 할인특약
  const specials: string[] = [];
  if (txt.match(/첨단안전장치|ADAS/i)) specials.push('첨단안전장치');
  if (txt.match(/블랙박스/))           specials.push('블랙박스할인');
  if (txt.match(/마일리지|주행거리/))   specials.push('마일리지 후할인');
  if (txt.match(/T[\-\s]?map|티맵/i))   specials.push('T-map 할인');
  if (specials.length) info.specials = specials.join(',');

  return info;
}

// ── 담보 파싱
function parseCoverages(txt: string, info: ParsedInfo): ParsedCoverage[] {
  const coverages: ParsedCoverage[] = [];

  // 대인II (항상 무한)
  coverages.push({ key: '대인II', val: '무한' });

  // 대물
  const daemulM = txt.match(/대물\s+(\d+억)/);
  coverages.push({ key: '대물', val: daemulM ? `${daemulM[1]}원` : '5억원' });

  // 자상
  const jasangM = txt.match(/자상\s+(\d+억\/\d+(?:천|억))/);
  if (jasangM) coverages.push({ key: '자상', val: jasangM[1] });

  // 무보험
  const muM = txt.match(/무보험\s+(\d+억)/);
  if (muM) coverages.push({ key: '무보험', val: `${muM[1]}원` });

  // 자기차량
  const jachaM = txt.match(/자기차량\s+(가입|미가입)/)
              || txt.match(/자차\s+(가입|미가입)/);
  coverages.push({ key: '자기차량', val: jachaM ? jachaM[1] : '가입' });

  // 긴급출동
  const emM = txt.match(/긴급출동[^\n]{0,40}?(기본형|고급형|확장형|미가입)/);
  if (emM) coverages.push({ key: '긴급출동', val: emM[1] });

  // 연령/운전범위 (파싱된 값 추가)
  if (info.age)   coverages.push({ key: '연령한정', val: info.age });
  if (info.drive) coverages.push({ key: '운전범위', val: info.drive });

  return coverages;
}

// ── 보험사 보험료 파싱 (아이코원/인스나라 공통)
function parseInsurers(txt: string): ParsedInsurer[] {
  const insurers: ParsedInsurer[] = [];

  const damboIdx = txt.indexOf('담보사항');
  const totalIdx = txt.indexOf('총금액');

  if (damboIdx !== -1 && totalIdx !== -1) {
    // 헤더에서 보험사 순서 감지
    const header    = txt.slice(damboIdx + 4, totalIdx);
    const ordered   = INS_MAP
      .map(([id, kw]) => ({ id, idx: header.indexOf(kw) }))
      .filter(p => p.idx !== -1)
      .sort((a, b) => a.idx - b.idx)
      .map(p => p.id);

    // 총금액 이후 보험료 추출
    const afterTotal = txt.slice(totalIdx + 3, totalIdx + 600);
    const cutIdx     = afterTotal.search(/CM보험료|가격비교|대인I/);
    const amts       = afterTotal.slice(0, cutIdx > 0 ? cutIdx : 400).match(/[\d,]+원/g) || [];

    ordered.forEach((id, i) => {
      const raw = parseInt((amts[i] || '0원').replace(/[^0-9]/g, '')) || 0;
      const off = trunc10(raw);
      if (off > 100_000) {
        insurers.push({ id, name: INS_NAMES[id] || id, off });
      }
    });
  }

  // 백업: 라인별 스캔
  if (insurers.length < 2) {
    const found = new Set(insurers.map(d => d.id));
    txt.split('\n').forEach(line => {
      for (const [id, kw] of INS_MAP) {
        if (found.has(id)) continue;
        const m = line.match(new RegExp(`${kw}[^\\d]*([\\d,]+)원`));
        if (m) {
          const off = trunc10(parseInt(m[1].replace(/,/g, '')));
          if (off > 100_000 && off < 9_000_000) {
            found.add(id);
            insurers.push({ id, name: INS_NAMES[id] || kw, off });
          }
        }
      }
    });
  }

  return insurers.sort((a, b) => a.off - b.off);
}

// ── 메인 파서 (외부 공개)
export function parseQuoteText(raw: string): ParseResult {
  const txt      = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const source   = detectSource(txt);
  const info     = parseInfo(txt);
  const coverages = parseCoverages(txt, info);
  const insurers  = parseInsurers(txt);

  return { source, info, coverages, insurers };
}
