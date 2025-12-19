import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>&copy; 2025 Debt Tracker. All rights reserved.</p>
        </div>
        <div className="footer-center">
          <p>Created by Marco A. Melgar</p>
        </div>
        <div className="footer-right">
          <div className="social-links">
            <a
              href="https://facebook.com/marcoamelgar"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              Facebook
            </a>
            <a
              href="https://linkedin.com/in/marcoamelgar"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer