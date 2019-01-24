import React from 'react'
import './bancor.widget.scss'

class Widget extends React.Component {

  componentDidMount() {
    const script = document.createElement('script')
    script.setAttribute(
      'src', 
      'https://widget-convert.bancor.network/v1')
    script.addEventListener('load', () => {
      window.BancorConvertWidget.init({
        "type": "1",
        "baseCurrencyId": "5a6f61ece3de16000123763a",
        "pairCurrencyId": "5937d635231e97001f744267",
        "primaryColor": "#00BFFF",
        "primaryColorHover": "#55DAFB"
      });
    })
    document.body.appendChild(script)
  }

  render() {
    return <div id="bancor-wc"></div>
  }
}

export default Widget