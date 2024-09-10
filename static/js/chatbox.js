// /workspaces/Python_JavaScriptTester/static/js/chatbox.js
import API from './api.js';
import UI from './ui.js';

export default class Chatbox {
    constructor() {
        this.api = new API();
        this.ui = new UI();
        this.imageFile = null; // Store the selected image file
    }

    // Method to initialize the chatbox event listeners and load files
    initialize() {
        const sendButton = document.querySelector('button');
        const fileInput = document.getElementById('file-upload');  // File input for image upload
        const fileSelect = document.getElementById('file-select'); // Dropdown for text file selection
        const removePreviewButton = document.querySelector('.remove-preview');  // Red X button for image removal

        sendButton.addEventListener('click', () => this.handleSendMessage());
        fileInput.addEventListener('change', (event) => this.handleFileSelection(event));
        removePreviewButton.addEventListener('click', () => this.removeImagePreview());

        // Fetch available files from the backend and populate the select element
        this.api.getFiles()
            .then(files => {
                this.ui.populateFileSelector(files);
            })
            .catch(error => console.error("Error fetching files:", error));
    }

    // Method to handle file selection (image upload)
    handleFileSelection(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.imageFile = file; // Store the selected image file
            this.ui.displayImagePreview(URL.createObjectURL(file)); // Display image preview
        } else {
            alert('Please select a valid image file.');
        }
    }

    // Method to remove the image preview
    removeImagePreview() {
        this.imageFile = null; // Clear the image file from memory
        this.ui.clearImagePreview(); // Clear image preview from UI
    }

    // Method to handle sending a message, selected text file, and optionally an image
    handleSendMessage() {
        const messageInput = this.ui.getMessageInput();
        const selectedFile = this.ui.getSelectedFile();

        // Debugging: Log the message and file to ensure they are correctly captured
        console.log("Message Input:", messageInput);
        console.log("Selected File:", selectedFile);
        console.log("Image File:", this.imageFile);

        // Case 1: Message, text file, and image
        if (messageInput && selectedFile && this.imageFile) {
            this.api.sendMessageWithImage(messageInput, selectedFile, this.imageFile)
                .then(response => this.handleResponse(response))
                .catch(error => console.error("Error sending message, file, and image:", error));
        }
        // Case 2: Only message and selected text file
        else if (messageInput && selectedFile) {
            this.api.sendMessage(messageInput, selectedFile)
                .then(response => this.handleResponse(response))
                .catch(error => console.error("Error sending message and file:", error));
        }
        // Case 3: Only image
        else if (!messageInput && this.imageFile) {
            this.api.sendImage(this.imageFile)
                .then(response => this.handleResponse(response))
                .catch(error => console.error("Error sending image:", error));
        }
        // Case 4: Neither message, file, nor image
        else {
            alert('Please enter a message, select a topic, or upload an image.');
        }
    }

    // Helper function to handle server response and display it in the chatbox
    handleResponse(response) {
        const question = response.question ? response.question : "Unknown question";
        const answer = response.answer ? response.answer : "I couldn't find an answer.";

        // Display the question and answer in the chatbox
        this.ui.displayMessage(`You: ${question}`);
        this.ui.displayMessage(`Bot: ${answer}`);
        this.ui.clearMessageInput();
    }
}

// Initialize the chatbox when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const chatbox = new Chatbox();
    chatbox.initialize();
});
