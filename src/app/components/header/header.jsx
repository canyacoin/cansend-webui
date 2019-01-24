import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Link, Icon, IconType } from 'app.elements'
import logo from 'app.images/cansend_logo.svg'
//import config from 'app.config';
import './header.scss'

const Header = ({ nav }) => {
  const handleClick = e => {
    e.preventDefault()
    e.stopPropagation()
    console.log(e)
  }

  return (
    <header className="component header">
      <div className="inner">
        <span className="left">
          <h1>
            <RouterLink to="/">
              <img alt="CanSend" src={logo} />
            </RouterLink>
          </h1>
        </span>
        <span className="right">
          <a href="https://blog.canya.com/" className="element link">
            BLOG
          </a>
          <a href="https://forum.canya.io/" className="element link">
            FORUM
          </a>
          <a href="https://t.me/canyacoin" className="element link">
            TELEGRAM<Icon type={IconType.SOCIAL.TELEGRAM} />
          </a>
          <Link to="/history" className={'element button outline'} onClick={e => handleClick(e)}>
            RECENT TRANSACTIONS
          </Link>
          {/*<Button to="/" onClick={e => handleClick(e)}>
            Join Canya
          </Button>*/}
        </span>
      </div>
    </header>
  )
}

export default Header
