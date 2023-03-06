import React, { useState } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    // send message to server or update state directly
    const newMessage = {
      text: inputValue,
      timestamp: Date.now(),
      sender: "user",
    };
    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  return (
    <Container className="chat-box-container">
      <Row className="message-container">
        <Col className="message-list">
          {messages.map((message) => (
            <div
              key={message.timestamp}
              className={`message ${
                message.sender === "user" ? "sent" : "received"
              }`}
            >
            <span className="message-text">{message.text}</span>
            </div>
          ))}
        </Col>
      </Row>
      <Row className="input-container">
        <Col>
          <Form.Control
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="message-input"
          />
        </Col>
        <Col xs="auto">
          <Button onClick={handleSendMessage} className="send-button">
            Send
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatBox;
