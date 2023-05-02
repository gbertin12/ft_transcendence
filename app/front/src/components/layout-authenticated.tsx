function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

export default function LayoutAuth(props: any): JSX.Element {
    return (
        <div> 
            <h1>Signed in</h1>
            <p><button onClick={logout}>Log out</button></p>
            {props.children}
        </div> 
    );
}
