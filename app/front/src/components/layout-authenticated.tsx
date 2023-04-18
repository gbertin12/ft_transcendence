function logout() {
    localStorage.removeItem('token');
    window.location = '/';
}

export default function LayoutAuth({ children }) {
    return (
        <div> 
            <h1>Signed in</h1>
            <p><button onClick={logout}>Log out</button></p>
            {children}
        </div> 
    );
}
