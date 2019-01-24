import React from 'react'
import './canapps.scss'

class CanApps extends React.Component {

  componentDidMount() {
    const script = document.createElement('script')
    script.setAttribute(
      'src', 
      'https://canya.io/assets/cancards.js')
    document.body.appendChild(script)

    const styles = document.createElement('link')
    styles.setAttribute(
      'href',
      'https://canya.io/assets/cancards.css')
    styles.setAttribute(
      'rel',
      'stylesheet')
    document.head.appendChild(styles)

    script.addEventListener('load', () => {
      if (window.createCards) {
        window.createCards()
      } else {
        setTimeout(window.createCards, 1000)
      }
    })
  }

  render () {
    return <div className="canAppDiv">
      <div id="canyaCard"></div>
    </div>
  }

}

export default CanApps
