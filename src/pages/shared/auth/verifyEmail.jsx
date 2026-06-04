
import {verifyEmailStyles as s} from '../../../assets/dummystyles';
import Navbar from '../../../components/common/Navbar';
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import  API_URL  from "../../../../config";

const VerifyEmail = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState (false);
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || "";
  const [email, setEmail] = useState(emailFromState);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
 try {
  const res = await axios.post(`${API_URL}/api/auth/verify-email`, { email, code });
  if (res.data.success) {
    setSuccess("Email verified successfully! Redirecting to login...");
    setTimeout(() => navigate("/login"), 2000);
  }
 } catch (err) {
  setError(err.response?.data?.message || "Verification failed. Please try again.");
 } finally {
  setIsLoading(false);
 }
};

  return (
    <div className={s.pageContainer}>
      <Navbar/>
      <div className={s.containerCenter}>
        <div className={s.card}>
          <h2 className={s.title}>Verify Your Email</h2>
          <p className={s.subtitle}>
            6-digit verification code has been sent to your email address. 
          </p>
          {error && <div className={s.errorAlert}>{error}</div>}
          {success && <div className={s.successAlert}>{success}</div>}
          <form onSubmit={handleSubmit} className={s.form}>
            {!emailFromState && (
              <div className={s.formGroup}>
                <label className={s.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={s.input}
                  required
                />
              </div>
            )}
            <div>
              <label className={s.label}>Verification Code</label>
              <input
                type="text" 
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={s.codeInput}
                placeholder="Enter 6-digit code"
                required
              />
                
        </div>
            <button type="submit" className={s.submitButton} disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
