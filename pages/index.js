import axios from 'axios';
import cookies from 'next-cookies'

import Base from '../layouts/Base';

const Index = props => {
    return (
        <Base user={ props.user }>
            
        </Base>
    )
}

Index.getInitialProps = function(context) {
    const { _user } = context.query;
    const accessToken = cookies(context)['accessToken'];

    return axios.get(`${process.env.BACK}/api/getUser/${accessToken}`).then(data => {
        return {
            ...this.props,
            user: data.data
        }
    })
}

export default Index;