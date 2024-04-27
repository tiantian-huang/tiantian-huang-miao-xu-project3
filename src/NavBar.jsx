import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from './AuthContext';

function NavBar() {
  const { user, logout } = useAuth();

  return (
    <Navbar style={{ backgroundColor: '#9c89b8' }} variant="dark" expand="lg">
      <Navbar.Brand href="/">Password Manager App</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <LinkContainer to="/">
            <Nav.Link>Home</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/password-manager">
            <Nav.Link className="text-nowrap">Password Manager</Nav.Link>
          </LinkContainer>
        </Nav>
        <Nav className="justify-content-end" style={{ width: '100%' }}>
          {user ? (
            <>
              <Nav.Link>Welcome, {user.username}</Nav.Link>
              <Button variant="outline-danger" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <LinkContainer to="/login">
                <Nav.Link>Login</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/register">
                <Nav.Link>Register</Nav.Link>
              </LinkContainer>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBar;
