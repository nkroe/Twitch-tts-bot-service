import { useEffect, useState } from 'react';
import axios from 'axios';
import cookies from 'next-cookies'

import Base from '../layouts/Base';

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

const Index = props => {

    const [userState, setUserState] = useState(0);
    
    useEffect(() => {
        const accessToken = getCookie('accessToken');
        axios.get(`http://localhost:8080/api/getUser/${accessToken}`).then(data => {
            setUserState(data.data)
        })
    }, [])

    return (
        <Base user={ userState }>
            
        </Base>
    )
}

export default Index;