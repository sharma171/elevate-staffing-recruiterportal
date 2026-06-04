import React from 'react'
import ReactDOM from 'react-dom';

import '../assets/styles/ConfirmationDialog.css'
import Loader from './Loader';
const ConfirmationDialogBox = ({isLoading, setConfirm, text, onConfirm, onCancel}) => {
  return ReactDOM.createPortal (
    <div>
        <div className='dialog-overlay width-100 height-100'></div>
        <div className='dialog-box'>
            <div className='dialog-content d-flex flex-column gap-10'>
            <p className='dialog-question'>{text}</p>
            <div className='d-flex justify-end gap-4'>
                <button className='dialog-cancel cursor-pointer' onClick={onCancel}>Go back</button>
                <button className='dialog-continue cursor-pointer d-flex justify-center' onClick={onConfirm}>
                  {isLoading ? <Loader/> : "Delete"}
                </button>
            </div>
            </div>
        </div>
    </div>,
    document.body
  )
}

export default ConfirmationDialogBox;