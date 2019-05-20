import Modal from "react-bootstrap-modal";
import React from "react";

const ModalButton = ({ title, description, children, onCancel }) => (
  <Modal show={true} aria-labelledby="ModalHeader" onHide={onCancel}>
    <Modal.Header closeButton>
      <Modal.Title id="ModalHeader">{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>{description}</p>
    </Modal.Body>
    <Modal.Footer>{children}</Modal.Footer>
  </Modal>
);

export default ModalButton;
