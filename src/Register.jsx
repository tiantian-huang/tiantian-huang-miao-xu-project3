import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import { useAuth } from './AuthContext';
import axios from 'axios';

function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [usernameState, setUsernameState] = useState('');
    const [passwordState, setPasswordState] = useState('');
    const [verifyPasswordState, setVerifyPasswordState] = useState('');
    const [errorMsgState, setErrorMsgState] = useState('');

    async function onSubmit(event) {
        event.preventDefault();
        if (!usernameState || !passwordState || !verifyPasswordState) {
            setErrorMsgState('All fields are required');
            return;
        }
        if (passwordState !== verifyPasswordState) {
            setErrorMsgState('Passwords do not match');
            return;
        }
        setErrorMsgState('');
        try {
            const response = await axios.post('/api/users/register', {
                username: usernameState,
                password: passwordState,
            });
            if (response.data.includes('created')) {
                login({ username: usernameState });
                navigate('/password-manager');
            } else {
                setErrorMsgState(response.data);
            }
        } catch (error) {
            setErrorMsgState(error.response?.data || "Failed to register");
        }
    }

    return (
        <div>
            <NavBar />
            <Container className="my-5">
                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <h1 className="text-center mb-4">Register Page</h1>
                        {errorMsgState && <div className="alert alert-danger">{errorMsgState}</div>}
                        <Form onSubmit={onSubmit}>
                            <Form.Group>
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" value={usernameState} onChange={e => setUsernameState(e.target.value)} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" value={passwordState} onChange={e => setPasswordState(e.target.value)} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Verify Password</Form.Label>
                                <Form.Control type="password" value={verifyPasswordState} onChange={e => setVerifyPasswordState(e.target.value)} />
                            </Form.Group>
                            <Row className="justify-content-md-center mt-3">
                                <Col className="d-flex justify-content-center">
                                    <Button variant="primary" type="submit" style={{ backgroundColor: '#9f86c0', borderColor: '#9f86c0' }}>Register</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Register;
