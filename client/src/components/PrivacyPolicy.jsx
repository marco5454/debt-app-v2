import { useNavigate } from 'react-router-dom'
import './PrivacyPolicy.css'

function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div className="privacy-policy">
      <div className="privacy-container">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          ← Back
        </button>
        
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: December 20, 2025</p>

        <section className="privacy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Debt Tracker ("we", "our", or "us"). This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our debt tracking application.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <ul>
            <li>Username and password for account creation</li>
            <li>Gender (optional)</li>
            <li>Email address (if provided for account recovery)</li>
          </ul>
          
          <h3>Financial Information</h3>
          <ul>
            <li>Debt details (name, total amount, interest rate, monthly payment)</li>
            <li>Creditor information</li>
            <li>Payment records and transaction history</li>
            <li>Loan dates and descriptions</li>
          </ul>
          
          <h3>Usage Information</h3>
          <ul>
            <li>Log information (access times, pages viewed)</li>
            <li>Device information (browser type, operating system)</li>
            <li>IP address</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our debt tracking services</li>
            <li>Create and manage your user account</li>
            <li>Process and track your debt and payment information</li>
            <li>Generate reports and analytics for your financial data</li>
            <li>Improve our application and user experience</li>
            <li>Communicate with you about your account</li>
            <li>Ensure the security and integrity of our services</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. Information Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties. 
            Your financial data is strictly confidential and is only accessible to you through your 
            secure account.
          </p>
          
          <h3>We may disclose your information only in the following circumstances:</h3>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations or court orders</li>
            <li>To protect our rights, property, or safety</li>
            <li>In connection with a business transfer or acquisition</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your 
            personal information against unauthorized access, alteration, disclosure, or destruction. 
            This includes:
          </p>
          <ul>
            <li>Encrypted data transmission (HTTPS)</li>
            <li>Secure password hashing</li>
            <li>Regular security updates and monitoring</li>
            <li>Limited access to personal data</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed 
            to provide you services. You may request deletion of your account and associated data 
            at any time by contacting us.
          </p>
        </section>

        <section className="privacy-section">
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct or update your information</li>
            <li>Delete your account and associated data</li>
            <li>Export your data</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>8. Cookies and Tracking</h2>
          <p>
            Our application may use local storage and session storage to enhance user experience 
            and maintain your login session. We do not use third-party tracking cookies.
          </p>
        </section>

        <section className="privacy-section">
          <h2>9. Children's Privacy</h2>
          <p>
            Our service is not intended for individuals under the age of 18. We do not knowingly 
            collect personal information from children under 18.
          </p>
        </section>

        <section className="privacy-section">
          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page with an updated "Last updated" date.
          </p>
        </section>

        <section className="privacy-section">
          <h2>11. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <div className="contact-details">
            <p>📧 Email: marco.me.personal@gmail.com</p>
            <p>📱 WhatsApp: 09309266746</p>
            <p>📘 Facebook: https://www.facebook.com/marco.adote.melgar.2024</p>
            <p>💼 LinkedIn: https://www.linkedin.com/in/marcomelgar54</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPolicy