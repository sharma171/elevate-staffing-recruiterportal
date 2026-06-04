import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "../assets/styles/LoginSignUp_v2.css";
import SignUpBg from "../assets/images/SignUpBg.jpg";
import { toast } from "react-toastify";
import makeRequest from "../helpers/http-request.js";
import { useNavigate } from "react-router-dom";
import Loader from '../components/Loader.jsx';
import eyeOpen from '../assets/images/eyeOpen.svg';
import eyeClose from '../assets/images/eyeClose.svg';
import emailSent from '../assets/images/emailSent.svg';

const LoginSignUp_v2 = () => {
  const [login, setIsLogin] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();
  

  const handleSignUp = async (data) => {
    setLoading(true);
    if(data.confirm_password !== data.password){
      setError("Both passwords should be same");
      setLoading(false);
      return;
    }

    if(data.mobile_number.length <10){
      setError("Enter a valid mobile number");
      setLoading(false);
      return;
    }

    const {confirm_password, ...formData} = data;

    try{
      const url = "https://us-east1-foursssolutions.cloudfunctions.net/user_authentication_api"

      const options = {
        url,
        method: "POST",
        data : {
          action: 'sign-up',
          app_name : 'recruitersportal',
          username : formData.email,
          ...formData
        }
      }

      const response = await makeRequest(options);
      if(response?.status == 200){
        toast.success("Registration successful.")
        navigate("/dashboard");
        setError("");
      }else{
        setError(response?.response?.data?.message);
      }
    }catch(err){
      console.log(err);
    }
    reset();
    setLoading(false);
  };

  const handleLogin = async (loginData) => {
    setError("");
    setLoading(true);
    try{

      const url = "https://us-east1-foursssolutions.cloudfunctions.net/user_authentication_api";

      const options = {
        url,
        method: "POST",
        data : {
          action:"sign-in",
          app_name: "recruitersportal",
          ...loginData,}
      }

      const response = await makeRequest(options);

      console.log(response);
      if(response?.status == 200){
        toast.success("Login successful");
        console.log(response);
      }else{
        setError(response?.response?.data?.message);
      }

    }catch(err){
      console.log(err);
    }

    reset();
    setLoading(false);
  };

  const handleForgotPassword = async (data) => {
    setError("");
    setLoading(true);

    try{
      const url = "https://us-east1-recruiterportal.cloudfunctions.net/user_authentication_api_v3";

      const options = {
        url,
        method: "POST",
        data : {
          action : "send-password-reset",
          ...data
        }
      }

      const response = await makeRequest(options);

      if(response?.status == 200){
        setPasswordReset(true);
      }else{
        setError(response?.response?.data.message);
      }
    }catch(err){
      console.log(err);
    }
    reset();
    setLoading(false);

  }

  return (
    <div className="v2-login-container width-100 vh-100 d-flex sm-flex-column">
      <div className="w-50 v2-login-body-1 sm-w-100 sm-h-50 md-w-50 height-100">
        <img className="width-100 height-100 v2-login-img" src={SignUpBg} />
        <div className="v2-login-overlay"></div>
      </div>
      <div className="v2-login-container-2 sm-w-100 w-50 md-w-50 sm-w-100 d-flex flex-column justify-center align-center">
        {!passwordReset ? (<div className="v2-login-body d-flex flex-column gap-4 md-gap-1 md-w-100 md-b-test">
          <div>
            <h1 className="v2-heading-1">
              <span className="heading-span">{forgotPassword ? "Forgot " : (login ? "Login" : "Sign up")}</span> {forgotPassword ? "password" : "now"}
            </h1>
            <p className="v2-text">{forgotPassword ? "Enter your registered email" : (login ? "Welcome back" : "Create a free account")}</p>
          </div>
          {forgotPassword ? (<div className="width-100">
            <form onSubmit={handleSubmit(handleForgotPassword)}>
              <div className="form-container">
                <label className="v2-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="v2-input"
                  id="email"
                  type="text"
                  placeholder="Email"
                  {...register("email",{required: "Email is required"})}
                />
                {errors.email && <span className='v2-login-error'>{errors.email.message}</span>}
               </div>
              <div className="v2-login-btn d-flex flex-column justify-center align-center gap-2">
                <button type="submit" className="cursor-pointer d-flex justify-center">
                {loading ? <Loader/> : "Send Link"}
                </button>
                <p className='v2-login-error'>{error}</p>
                <p className="v2-text text-underline cursor-pointer" onClick={()=>{
                  setForgotPassword(false)
                  reset()
                  setError("")}}>Go back</p>
              </div>
            </form>
          </div>): ( login ? (<div className="width-100">
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="form-container">
                <label className="v2-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="v2-input"
                  id="username"
                  type="text"
                  placeholder="Email"
                  {...register("username",{required: "Email is required"})}
                />
                {errors.email && <span className='v2-login-error'>{errors.email.message}</span>}
               </div>
               <div className="form-container">
                <label className="v2-label" htmlFor="password">
                  Password
                </label>
                <div className="d-flex justify-center align-center v2-password">
                <input
                  className="v2-input"
                  id="email"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password",{required: "Password is required"})}
                />
                <div className="cursor-pointer mt-2" onClick={()=>setShowPassword(!showPassword)}>
                  <img src={showPassword ? eyeClose :eyeOpen}/>
                </div>
                </div>
                {errors.password && <span className='v2-login-error'>{errors.password.message}</span>}
               </div>
              <div className="v2-login-btn d-flex flex-column justify-center align-center gap-2">
                <button type="submit" className="cursor-pointer d-flex justify-center">
                  {loading ? <Loader/> : "Login"}
                </button>
                <p className='v2-login-error'>{error}</p>
                <div className="width-100 d-flex justify-between">
                <p className="v2-text">New User? <span className="heading-span text-underline cursor-pointer"  onClick={()=>{
                    setIsLogin(false) 
                    reset()
                    setError("")
                    setShowPassword(false);
                    }}>Signup</span></p>
                <p className="v2-text cursor-pointer" onClick={()=>{
                    setForgotPassword(true)
                    reset()
                    }}>Forgot Password</p>
                </div>
              </div>
            </form>
          </div> ) : (
            <div className="width-100">
            <form onSubmit={handleSubmit(handleSignUp)}>
              <div className="form-container">
                <label className="v2-label" htmlFor="first_name">
                  First Name
                </label>
                <input
                  className="v2-input"
                  id="first_name"
                  type="text"
                  placeholder="First name"
                  {...register("first_name",{required: "First name is required"})}
                />
                {errors.first_name && <span className='v2-login-error'>{errors.first_name.message}</span>}
              </div>
              <div className="form-container">
                <label className="v2-label" htmlFor="last_name">
                  Last Name
                </label>
                <input
                  className="v2-input"
                  id="last_name"
                  type="text"
                  placeholder="Last name"
                  {...register("last_name",{required: "Last name is required"})}
                />
                {errors.last_name && <span className='v2-login-error'>{errors.last_name.message}</span>}
              </div>
              <div className="form-container">
                <label className="v2-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="v2-input"
                  id="email"
                  type="text"
                  placeholder="Email"
                  {...register("email",{required: "Email is required"})}
                />
                {errors.email && <span className='v2-login-error'>{errors.email.message}</span>}
               </div>
              <div className="form-container">
                <label className="v2-label" htmlFor="mobile_number">
                  Phone
                </label>
                <div className="phone-container d-flex justify-between">
                  <select className="login-dropDown" name="country_code" {...register("country_code",{required: "Country code is required"})}>
                      <option value="+91">+91(IND)</option>
                      <option value="+1">+1(US)</option>
                    </select>
                  <div className="width-100">
                    <input
                      className="v2-input phone-input"
                      id="mobile_number"
                      type="number"
                      placeholder="Phone"
                      {...register("mobile_number",{required: "Phone is required"})}
                    />
                  </div>
                </div>
                {errors.phone && <span className='v2-login-error'>{errors.phone.message}</span>}
              </div>
              <div className="d-flex justify-between gap-4">
                <div className="form-container password-container">
                  <label className="v2-label" htmlFor="password">
                    Password
                  </label>
                  <div className="d-flex justify-center align-center v2-password">
                      <input
                        className="v2-input"
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...register("password",{required: 'Password is required'})}
                      />
                      <div className="cursor-pointer mt-2"  onClick={()=>setShowPassword(!showPassword)}>
                      <img src={showPassword ? eyeClose :eyeOpen}/>
                      </div>
                    </div>
                {errors.password && <span className='v2-login-error'>{errors.password.message}</span>}
                </div>
                <div className="form-container password-container">
                  <label className="v2-label" htmlFor="re-password">
                    Re-enter password
                  </label>
                  <div className="d-flex justify-center align-center v2-password">
                  <input
                    className="v2-input"
                    id="re-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    {...register("confirm_password",{required: 'Password is required'})}
                  />
                   <div className="cursor-pointer mt-2" onClick={()=>setShowPassword(!showPassword)}>
                   <img src={showPassword ? eyeClose :eyeOpen}/>
                   </div>
                    </div>
                {errors.confirm_password && <span className='v2-login-error'>{errors.confirm_password.message}</span>}
                </div>
              </div>
              <div className="v2-login-btn d-flex flex-column justify-center align-center gap-2">
                <button type="submit" className="cursor-pointer">
                {loading ? <Loader/> : "Sign up"}
                </button>
                <p className='v2-login-error'>{error}</p>
                <p className="v2-text">Already a user? <span className="heading-span text-underline cursor-pointer"  onClick={()=>{
                    setIsLogin(true)
                    reset()
                    setError("")
                    setShowPassword(false);
                }}>Login</span></p>
              </div>
            </form>
          </div>
        ))}
        </div>):(
        <div className="width-100 d-flex flex-column justify-center align-center gap-4">
          <img src={emailSent}/>
          <p>Reset Link sent to you email</p>
        </div>)}
      </div>
    </div>
  )
}

export default LoginSignUp_v2;
