import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import NavBar from './NavBar';

function HomePage({ isLoggedIn, username }) {
  return (
    <div>
      <NavBar isLoggedIn={isLoggedIn} username={username} />
      <Container className="my-5">
        <Row className="justify-content-md-center">
          <Col md={6} className="text-center">
            <h2 style={{ color: '#9c89b8' }}>Welcome to Password Manager App</h2>
            <p>Manage your passwords easily and securely.</p>
            <p>Created by: Tiantian Huang and Miao Xu.</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default HomePage;
