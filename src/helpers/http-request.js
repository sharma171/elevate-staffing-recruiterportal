import axios from 'axios';

axios.defaults.headers["Content-Type"] = "application/json";

const makeRequest = async (options) => {
    try{
        const res = await axios.request(options);
        return res;
    }catch(err){
        return err;
    }
}

export default makeRequest