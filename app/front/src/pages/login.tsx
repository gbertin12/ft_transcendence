import Layout from '@/components/layout'
import jwtDecode, { JwtPayload } from 'jwt-decode';

async function login() {
    const res = await fetch('http://localhost:3000/auth/oauth/state');
    const data = await res.json();
    if (data.state) {
        document.cookie = `state=${data.state};SameSite=None`;
        const payload = jwtDecode<JwtPayload>(data.state);
        window.location = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-392e919c5957cd22c186e082804f1b9378ca5c2d56984a0c763c7104f165aa0a&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Foauth%2Fcallback&response_type=code&state=${payload.state}`;
    }
}

export default function Login() {
    return (
        <Layout>
            <h2>Login Page</h2>
            <button onClick={login}>login</button>
        </Layout>
    )
}
