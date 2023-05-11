async function login() {
    const res = await fetch('http://localhost:3000/auth/42/state', { credentials: 'include' });
    const state_token = await res.text();
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-392e919c5957cd22c186e082804f1b9378ca5c2d56984a0c763c7104f165aa0a&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2F42%2Fcallback&response_type=code&state=${state_token}`;
}

function dummyLogin() {
    window.location.href = 'http://localhost:3000/auth/dummy';
}

export default function Login() {
    return (
        <>
            <h2>Login Page</h2>
            <button onClick={login}>login</button>
            <button onClick={dummyLogin}>dummy login</button>
        </>
    )
}
