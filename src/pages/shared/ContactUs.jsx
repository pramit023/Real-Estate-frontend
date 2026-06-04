import React, { useState } from 'react';
import axios from 'axios';
import { HiCheckCircle, HiMail, HiOutlineChatAlt2, HiPhone, HiUser } from 'react-icons/hi';
import API_URL from '../../../config';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { contactStyles as s } from '../../assets/dummystyles';

const ContactUs = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setNotice('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotice('');

    try {
      const res = await axios.post(`${API_URL}/api/contact`, {
        ...formData,
        role: user?.role === 'seller' ? 'seller' : 'buyer',
      });

      setNoticeType('success');
      setNotice(res.data.message || 'Message sent successfully.');
      setFormData((prev) => ({ ...prev, message: '' }));
    } catch (err) {
      setNoticeType('error');
      setNotice(err.response?.data?.message || 'Unable to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.container}>
      <Navbar />

      <main className={s.mainContainer}>
        <header className={s.header}>
          <h1 className={s.heading}>Get In Touch</h1>
          <p className={s.subheading}>
            Have questions or feedback? We'd love to hear from you. Our team is here to help you with anything you need.
          </p>
        </header>

        <div className={s.grid}>
          <aside className={s.contactInfoContainer}>
            <section className={s.contactInfoCard}>
              <div className={`${s.contactItem} ${s.contactItemMarginBottom}`}>
                <div className={s.contactIconWrapper}>
                  <HiMail className="text-xl" />
                </div>
                <div>
                  <h2 className={s.contactTitle}>Email Us</h2>
                  <p className={s.contactDetail}>support@realestate.com</p>
                </div>
              </div>

              <div className={s.contactItem}>
                <div className={s.contactIconWrapperAlt}>
                  <HiPhone className="text-xl" />
                </div>
                <div>
                  <h2 className={s.contactTitle}>Call Us</h2>
                  <p className={s.contactDetail}>+1 (234) 567-7890</p>
                </div>
              </div>
            </section>

            <section className={s.quickSupportCard}>
              <h2 className={s.quickSupportTitle}>Quick Support</h2>
              <p className={s.quickSupportText}>Available 24/7 for our premium members.</p>
              <p className={s.quickSupportText}>Your satisfaction is our priority.</p>
            </section>
          </aside>

          <section className={s.formCard}>
            {notice && noticeType === 'success' ? (
              <div className={s.successContainer}>
                <HiCheckCircle size={56} className={s.successIcon} />
                <h2 className={s.successTitle}>Message Sent</h2>
                <p className={s.successMessage}>{notice}</p>
                <button
                  type="button"
                  className={s.successButton}
                  onClick={() => setNotice('')}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className={s.form} onSubmit={handleSubmit}>
                {notice && <div className={s.errorMessage}>{notice}</div>}

                <div className={s.formTwoColGrid}>
                  <label className={s.inputGroup}>
                    <span className={s.label}>
                      <HiUser className="mr-2 inline" />
                      Name
                    </span>
                    <input
                      className={s.input}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label className={s.inputGroup}>
                    <span className={s.label}>
                      <HiMail className="mr-2 inline" />
                      Email
                    </span>
                    <input
                      className={s.input}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>

                <label className={s.inputGroup}>
                  <span className={s.label}>
                    <HiPhone className="mr-2 inline" />
                    Phone
                  </span>
                  <input
                    className={s.input}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </label>

                <label className={s.inputGroup}>
                  <span className={s.label}>
                    <HiOutlineChatAlt2 className="mr-2 inline" />
                    Message
                  </span>
                  <textarea
                    className={`${s.input} ${s.textarea}`}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={7}
                    required
                    placeholder="Tell us how we can help..."
                  />
                </label>

                <button type="submit" className={s.submitButton} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;
