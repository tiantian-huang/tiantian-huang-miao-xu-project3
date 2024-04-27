import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Modal } from 'react-bootstrap';
import NavBar from './NavBar';
import { useAuth } from './AuthContext';
import axios from 'axios';

function PasswordManagerPage() {
    const { user } = useAuth();
    const [url, setUrl] = useState('');
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(8);
    const [passwords, setPasswords] = useState([]);
    const [shareUsername, setShareUsername] = useState('');
    const [shareRequests, setShareRequests] = useState([]);
    const [settings, setSettings] = useState({
        alphabet: false,
        numerals: false,
        symbols: false
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedPassword, setSelectedPassword] = useState({ url: '', password: '', _id: '' });
    const [visiblePasswords, setVisiblePasswords] = useState({});



    useEffect(() => {
        if (user && user.username) {
            fetchPasswords();
            loadShareRequests();
        } else {
            setPasswords([]);
            setShareRequests([]);
        }
    }, [user]);
    

    async function fetchPasswords() {
        try {
            const response = await axios.get(`/api/passwords/${user.username}`);
            const passwords = response.data.passwords || [];
    
            const sharedResponse = await axios.get(`/api/passwords/shared-with/${user.username}`);
            const sharedPasswords = sharedResponse.data || [];
    
            const combinedPasswords = [...passwords, ...sharedPasswords].reduce((acc, current) => {
                const x = acc.find(item => item._id === current._id);
                if (!x) {
                    return acc.concat([current]);
                } else {
                    return acc;
                }
            }, []);
    
            setPasswords(combinedPasswords);
        } catch (error) {
            console.error('Failed to fetch passwords:', error);
        }
    }
    
    const loadShareRequests = async () => {
        try {
            const response = await axios.get(`/api/passwords/share-requests/${user.username}`);
            if (response.status === 200 && Array.isArray(response.data)) {
                setShareRequests(response.data);
            } else {
                console.error('Expected an array for share requests, received:', response.data);
                setShareRequests([]);
            }
        } catch (error) {
            console.error('Failed to load share requests:', error);
        }
    };
    
    
    

    const handleInputChange = (event) => {
        const { name, value, checked, type } = event.target;
        if (type === 'checkbox') {
            setSettings(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'text' || type === 'number') {
            switch (name) {
                case 'url': setUrl(value); break;
                case 'password': setPassword(value); break;
                case 'length': setLength(value); break;
                case 'shareUsername': setShareUsername(value); break;
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!url) {
            alert("Please enter a URL.");
            return;
        }
        if (!password && (!settings.alphabet && !settings.numerals && !settings.symbols)) {
            alert("At least one checkbox must be checked to generate a password.");
            return;
        }
        if (!password && (length < 4 || length > 50)) {
            alert("Generated password length must be between 4 and 50.");
            return;
        }
        if (password && (password.length < 4 || password.length > 50)) {
            alert("Password length must be between 4 and 50.");
            return;
        }
        const generatedPassword = password || generatePassword();
        const payload = { url, password: generatedPassword, username: user.username };

        try {
            await axios.post('/api/passwords', payload);
            fetchPasswords();
            setUrl(''); 
            setPassword('');
            setSettings({ alphabet: false, numerals: false, symbols: false });
            setLength(8);
        } catch (error) {
            console.error("Failed to save the password:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/passwords/${id}`);
            fetchPasswords();
        } catch (error) {
            console.error('Failed to delete password:', error);
        }
    };

    const handleUpdateModal = (password) => {
        setSelectedPassword(password);
        setShowModal(true);
    };

    const handleUpdatePassword = async () => {
        try {
            await axios.put(`/api/passwords/${selectedPassword._id}`, { url: selectedPassword.url, password: selectedPassword.password });
            setShowModal(false);
            fetchPasswords();
        } catch (error) {
            console.error('Failed to update password:', error);
        }
    };

    const handleShare = async () => {
        if (shareUsername === user.username) {
            alert("Cannot share with yourself.");
            return;
        }
        try {
            const response = await axios.post('/api/passwords/share', { targetUsername: shareUsername, ownerUsername: user.username });
            alert('Share request sent!');
        } catch (error) {
            console.error('Failed to send share request:', error);
            alert(`Failed to send share request: ${error.response?.data || "Unknown error occurred"}`);
        }
    };

    const generatePassword = () => {
        const chars = {
            alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
            numerals: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
    
        let validChars = '';
        if (settings.alphabet) validChars += chars.alphabet;
        if (settings.numerals) validChars += chars.numerals;
        if (settings.symbols) validChars += chars.symbols;
    
        let array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        let result = Array.from(array, byte => validChars[byte % validChars.length]).join('');
    
        return result;
    };
    
    const acceptShare = async (requestId) => {
        try {
            const response = await axios.post(`/api/passwords/accept-share/${requestId}`);
            alert('Share request accepted!');
            loadShareRequests();
            fetchPasswords(); 
        } catch (error) {
            console.error('Failed to accept share request:', error);
            alert(`Failed to accept share request: ${error.response?.data || "Unknown error occurred"}`);
        }
    };
    const rejectShare = async (requestId) => {
        try {
            const response = await axios.post(`/api/passwords/reject-share/${requestId}`);
            alert('Share request rejected.');
            loadShareRequests();
        } catch (error) {
            console.error('Failed to reject share request:', error);
            alert(`Failed to reject share request: ${error.response?.data || "Unknown error occurred"}`);
        }
    };
    const copyToClipboard = (password) => {
        navigator.clipboard.writeText(password).then(() => {
            alert('Password copied to clipboard!');
        }, (err) => {
            console.error('Failed to copy password: ', err);
        });
    };
    const togglePasswordVisibility = (id) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };
    
    
        

    return (
        <div>
            <NavBar isLoggedIn={!!user} username={user ? user.username : ''} />
            <Container className="my-5">
                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <h1 className="text-center mb-4">Password Manager</h1>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group>
                                <Form.Label>URL</Form.Label>
                                <Form.Control type="text" placeholder="Enter URL" value={url} onChange={handleInputChange} name="url" />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="text" placeholder="Enter password or generate" value={password} onChange={handleInputChange} name="password" />
                            </Form.Group>
                            <Form.Group>
                                <div className="mb-3">
                                    <Form.Check inline label="Alphabets" type="checkbox" name="alphabet" checked={settings.alphabet} onChange={handleInputChange} />
                                    <Form.Check inline label="Numerals" type="checkbox" name="numerals" checked={settings.numerals} onChange={handleInputChange} />
                                    <Form.Check inline label="Symbols" type="checkbox" name="symbols" checked={settings.symbols} onChange={handleInputChange} />
                                </div>
                                <Form.Control type="number" placeholder="Password Length" value={length} onChange={handleInputChange} name="length" />
                            </Form.Group>
                            <Row className="justify-content-md-center mt-3">
                                <Col className="d-flex justify-content-center">
                                    <Button variant="primary" type="submit" style={{ backgroundColor: '#9f86c0', borderColor: '#9f86c0' }}>Save Password</Button>
                                </Col>
                            </Row>
                        </Form>
                        <div className="password-list mt-4">
    <h4>Saved Passwords:</h4>
    {user && passwords.map((password, index) => (
        <Row className="align-items-center" key={password._id + index}>
            <Col xs={6} md={4} className="mb-2">
                {password.url} - {visiblePasswords[password._id] ? password.password : '••••••••'} 
            </Col>
            <Col xs={6} md={8} className="text-md-right">
                Updated at: {new Date(password.updatedAt).toLocaleString()}
                {password.username === user.username ? (
                    <>
                        <Button variant="secondary" size="sm" onClick={() => togglePasswordVisibility(password._id)}>Show/Hide</Button>
                        <Button variant="info" size="sm" onClick={() => copyToClipboard(password.password)}>Copy</Button>
                        <Button size="sm" onClick={() => handleUpdateModal(password)}>Update</Button>
                        <Button size="sm" onClick={() => handleDelete(password._id)} variant="danger">Delete</Button>
                    </>
                ) : (
                    <>
                        <span> - Shared by {password.username}</span>
                        <Button variant="secondary" size="sm" onClick={() => togglePasswordVisibility(password._id)}>Show/Hide</Button>
                        <Button variant="info" size="sm" onClick={() => copyToClipboard(password.password)}>Copy</Button>
                    </>
                )}
            </Col>
        </Row>
    ))}
</div>


                        <Form onSubmit={handleShare}>
                            <Form.Group>
                                <Form.Label>Share With</Form.Label>
                                <InputGroup>
                                    <Form.Control type="text" placeholder="Enter username" value={shareUsername} onChange={handleInputChange} name="shareUsername" />
                                    <Button variant="secondary" onClick={handleShare}>Share</Button>
                                </InputGroup>
                            </Form.Group>
                        </Form>
                        {showModal && (
                            <Modal show={showModal} onHide={() => setShowModal(false)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Update Password</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>URL</Form.Label>
                                            <Form.Control type="text" placeholder="Enter URL" value={selectedPassword.url} onChange={(e) => setSelectedPassword({ ...selectedPassword, url: e.target.value })} />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control type="password" placeholder="Enter Password" value={selectedPassword.password} onChange={(e) => setSelectedPassword({ ...selectedPassword, password: e.target.value })} />
                                        </Form.Group>
                                        <Button variant="primary" onClick={handleUpdatePassword}>Update Password</Button>
                                    </Form>
                                </Modal.Body>
                            </Modal>
                        )}
                        {shareRequests.length > 0 && (
                            <div className="share-requests">
                                <h5>Share Requests:</h5>
                                {shareRequests.map((request) => (
                                    <div key={request._id}>
                                        <p>{request.requester} wants to share passwords with you.</p>
                                        <Button onClick={() => acceptShare(request._id)} variant="success">Accept</Button>
                                        <Button onClick={() => rejectShare(request._id)} variant="danger">Reject</Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default PasswordManagerPage;

