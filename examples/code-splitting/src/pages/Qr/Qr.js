import {QRCodeSVG} from 'qrcode.react';
import './Qr.css'

export default function Qr() {
  return (
    <div className='qr'>
      <h1>My Old Boss Uses QRs Before 2020</h1>
      <QRCodeSVG value='FabiOne Rul3z' size={400} />
    </div>
  )
}