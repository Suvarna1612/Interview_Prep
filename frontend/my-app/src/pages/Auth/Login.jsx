import {useState, useContext} from 'react'
import { useNavigate } from "react-router-dom";
import Input from "../../components/inputs/Input";
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
const Login = ({setCurrentPage}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const {updateUser} = useContext(UserContext);
  const navigate = useNavigate();
  //Handling Login form submit

  const handleLogin = async (e) => {
    e.preventDefault();
    if(!validateEmail(email)){
      setError("Please enter a valid email address.");
      return;
    }
    if(!password){
      setError("Please enter a password.");
      return;
    }
    setError("");

    //Login API call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN,{
        email,
        password
      })

      const {token} = response.data;
      if(token){
        localStorage.setItem("token", token);
        updateUser(response.data);
        navigate("/dashboard");
      }
    } catch (error) {
      if(error.response && error.response.data.message){
        setError(error.response.data.message);
      }else{
        setError("Something went wrong. Please try again.");
      }
    }
  }
  return (
    <div className='w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center '>
      <h3 className='text-lg font-semibold text-black'>Welcome back</h3>
      <p className='text-xs text-slate-700 mt-[5px] mb-6' >Please enter your details to log in</p>
      <form onSubmit={handleLogin}>
        <Input
          value={email}
          label="Email Address"
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          value={password}
          label="Enter Password"
          placeholder="min 8 characters"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className='text-xs text-red-600 pb-2.5'>{error}</p>}
        <button type="submit" className='btn-primary'>LOGIN</button>
        <p className='text-[13px] text-slate-800 mt-3'>
          Don't have an account?{" "}
          <button
            className='font-medium text-primary underline cursor-pointer ml-1'
            onClick={() => setCurrentPage("signup")}
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  )
}

export default Login