import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../authContext';

const RegisterCandidate = () => {
    return (
        <div>
            <div className="registerpage">
                <div className="form-container">
                    <div className="row-flex">
                        <div className="col-flex">
                            <div className="input col-flex">
                                <span className="head">Username</span>
                                <input 
                                    type="text" 
                                    className="login-input"
                                    placeholder="Enter Username"
                                />
                            </div>
                        </div>
                        <div className="col-flex">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterCandidate;
