import React from 'react'
import { Link, Social, BancorWidget, CanApps } from 'app.elements'
import canya_logo_main from 'app.images/canya_logo_main.svg'
import canya_logo from 'app.images/canya_logo@2x.png'
import './footer.scss'

const Footer = ({ copyright, nav }) => {
  return (
    <footer className="component footer">
      <BancorWidget />
      <CanApps />
      <div className="cta">
        <img alt="CanYa" src={canya_logo} />
        <p>The World’s Best Blockchain-Powered Marketplace of Services.</p>
        <a to="https://canya.io/" target="_blank">
          Join Now
        </a>
      </div>

      <div className="links">
        <div className="inner">
          <div className="left">
            <img src={canya_logo_main} alt="CanSend" />
          </div>
          <div className="right">
            <a href="https://blog.canya.com/" className="element link">
              BLOG
            </a>
            <a href="https://forum.canya.io/" className="element link">
              FORUM
            </a>
            <Link to="/faqs">FAQs</Link>
            <Link to="/terms-and-conditions">TERMS & CONDITIONS</Link>
            <Social />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
