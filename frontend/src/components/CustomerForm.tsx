import React, { useState } from 'react';

interface Props {
  customer: any | null;
  onSave: (data: any) => void;
  onClose: () => void;
}

export default function CustomerForm({ customer, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    car_number: customer?.car_number || '',
    car_model: customer?.car_model || '',
    car_year: customer?.car_year || '',
    birthdate: customer?.birthdate?.split('T')[0] || '',
    gender: customer?.gender || '',
    address: customer?.address || '',
    memo: customer?.memo || '',
    source: customer?.source || 'direct',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Please enter customer name');
      return;
    }
    onSave({
      ...form,
      car_year: form.car_year ? Number(form.car_year) : null,
      birthdate: form.birthdate || null,
    });
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      background: '#fff',
      borderRadius: 16,
      width: 520,
      maxHeight: '90vh',
      overflow: 'auto' as const,
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    header: {
      padding: '20px 24px',
      borderBottom: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: 700 as const,
      color: '#1a1a2e',
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: 24,
      cursor: 'pointer',
      color: '#999',
      padding: '0 4px',
    },
    body: {
      padding: '20px 24px',
    },
    row: {
      display: 'flex' as const,
      gap: 12,
      marginBottom: 16,
    },
    field: {
      flex: 1,
    },
    label: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600 as const,
      color: '#555',
      marginBottom: 6,
    },
    required: {
      color: '#e53935',
      marginLeft: 2,
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: 8,
      fontSize: 14,
      outline: 'none',
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: 8,
      fontSize: 14,
      outline: 'none',
      background: '#fff',
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: 8,
      fontSize: 14,
      outline: 'none',
      minHeight: 80,
      resize: 'vertical' as const,
    },
    footer: {
      padding: '16px 24px',
      borderTop: '1px solid #eee',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
    },
    btnCancel: {
      padding: '10px 20px',
      border: '1px solid #ddd',
      borderRadius: 8,
      background: '#fff',
      fontSize: 14,
      cursor: 'pointer',
    },
    btnSave: {
      padding: '10px 24px',
      border: 'none',
      borderRadius: 8,
      background: '#6c63ff',
      color: '#fff',
      fontSize: 14,
      fontWeight: 600 as const,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>
            {customer ? 'Edit Customer' : 'New Customer'}
          </span>
          <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.body}>
            {/* Name & Phone */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Name<span style={styles.required}>*</span>
                </label>
                <input style={styles.input} name="name" value={form.name} onChange={handleChange} placeholder="Customer name" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Phone</label>
                <input style={styles.input} name="phone" value={form.phone} onChange={handleChange} placeholder="010-0000-0000" />
              </div>
            </div>

            {/* Car Number & Model */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Car Number</label>
                <input style={styles.input} name="car_number" value={form.car_number} onChange={handleChange} placeholder="12ga3456" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Car Model</label>
                <input style={styles.input} name="car_model" value={form.car_model} onChange={handleChange} placeholder="Sonata" />
              </div>
            </div>

            {/* Car Year & Birthdate */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Car Year</label>
                <input style={styles.input} name="car_year" type="number" value={form.car_year} onChange={handleChange} placeholder="2024" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Birthdate</label>
                <input style={styles.input} name="birthdate" type="date" value={form.birthdate} onChange={handleChange} />
              </div>
            </div>

            {/* Gender & Source */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Gender</label>
                <select style={styles.select} name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Source</label>
                <select style={styles.select} name="source" value={form.source} onChange={handleChange}>
                  <option value="direct">Direct</option>
                  <option value="referral">Referral</option>
                  <option value="ad">Advertisement</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Address</label>
              <input style={styles.input} name="address" value={form.address} onChange={handleChange} placeholder="Address" />
            </div>

            {/* Memo */}
            <div style={{ marginBottom: 8 }}>
              <label style={styles.label}>Memo</label>
              <textarea style={styles.textarea} name="memo" value={form.memo} onChange={handleChange} placeholder="Notes..." />
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" style={styles.btnCancel} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.btnSave}>
              {customer ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
