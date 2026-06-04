import React, { useState, useEffect } from 'react';
import { useAuth } from '../../authContext';

const CandidateDetailsModal = ({ candidate, onClose }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [comment, setComment] = useState('');
    const [fetchComment, setFetchComment] = useState([]);
    const [nav, setNav] = useState('submission');
    const today = new Date().toLocaleDateString(); // Get today's date as a localized string
    const {user} = useAuth();

    // Function to handle card click and set active index
    const handleCardClick = (index) => {
        setActiveIndex(index);
    };

    // Check if any candidate's latest_submission_date is not today
    const showCommentButton = candidate?.some(item => {
        const submissionDate = new Date(item.latest_submission_date).toLocaleDateString();
        return submissionDate !== today;
    }) ?? false;

    useEffect(() => {
        if (candidate && candidate[activeIndex]) {
            const activeCandidateEmail = candidate[activeIndex].email;
            // Fetch comments for the active candidate
            fetch('https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailid : user.email,
                    query: `SELECT submission_comments FROM foursphere_recruiters.bench_candidates WHERE primary_email = '${activeCandidateEmail}'`
                })
            })
            .then(response => response.json())
            .then(data => {
                let comments = [];

                // Parse the comments depending on the format (either string or JSON array)
                const rawComments = data[0]?.submission_comments;
                if (typeof rawComments === 'string') {
                    try {
                        comments = JSON.parse(rawComments);
                    } catch (error) {
                        // If JSON parsing fails, treat it as plain text
                        comments = [{ comment: rawComments, date: '' }];
                    }
                } else {
                    comments = rawComments || [];
                }

                setFetchComment(comments);
            })
            .catch(error => console.error('Error fetching candidates:', error));
        }
    }, [activeIndex, candidate]);

    if (!candidate || !Array.isArray(candidate) || candidate.length === 0) return null;

    // Function to handle comment submission
    const handleSubmitComment = () => {
        if (!comment.trim()) {
            alert('Please enter a comment.');
            return;
        }

        const activeCandidateEmail = candidate[activeIndex].email;
        
        // Prepare the new comment object
        const newComment = {
            comment: comment,
            date: new Date().toLocaleDateString() // Store the date in a localized format
        };

        // Fetch the existing comments and append the new one
        fetch('https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emailid : user.email,
                query: `SELECT submission_comments FROM foursphere_recruiters.bench_candidates WHERE primary_email = '${activeCandidateEmail}'`
            })
        })
        .then(response => response.json())
        .then(data => {
            let existingComments = [];

            // Handle JSON or plain text comments
            const rawComments = data[0]?.submission_comments;
            if (typeof rawComments === 'string') {
                try {
                    existingComments = JSON.parse(rawComments);
                } catch (error) {
                    // If parsing fails, treat the existing comment as plain text
                    existingComments = [{ comment: rawComments, date: '' }];
                }
            } else {
                existingComments = rawComments || [];
            }

            // Append the new comment to the existing comments
            const updatedComments = [...existingComments, newComment];

            // Update the submission_comments field with the new array
            fetch('https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailid : user.email,
                    query: `
                        UPDATE foursphere_recruiters.bench_candidates
                        SET submission_comments = '${JSON.stringify(updatedComments)}'
                        WHERE primary_email = '${activeCandidateEmail}'
                    `
                })
            })
            .then(response => response.json())
            .then(() => {
                console.log('Comment submitted successfully.');
                alert('Comment submitted successfully.');
                setComment(''); // Clear the input field
                setFetchComment(updatedComments); // Update local comments state
            })
            .catch(error => {
                console.error('Error submitting comment:', error);
                alert('Failed to submit comment.');
            });
        })
        .catch(error => console.error('Error fetching existing comments:', error));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content row-flex">
                <div className=" left-tab col-flex">
                    <h2>Submission Details</h2>
                    
                    {/* Submissions Tab */}
                    <div className={`card-container navTab col-flex ${nav === "submission" ? "active" : ""}`}>
                        {candidate.map((item, index) => (
                            <div 
                                key={index}
                                className={`submission-card col-flex ${index === activeIndex ? 'active' : ''}`} 
                                onClick={() => handleCardClick(index)}
                            >
                                <p className="active-view"><strong>Full Name:</strong> {item.candidate_full_name}</p>
                                <p className="view"><strong>Client Name:</strong> {item.client_name}</p>
                                <p className="active-view"><strong>Email:</strong> {item.email}</p>
                                <p className="active-view"><strong>Assigned Recruiter:</strong> {item.from_email}</p>
                                <p className="active-view"><strong>Vendor:</strong> {item.to_email}</p>
                                <p className="active-view"><strong>Rate:</strong> {item.rate}</p>
                                <p className="active-view"><strong>Submission Status:</strong> {item.submission_status}</p>
                                <p className="view"><strong>Latest Submission Date:</strong> {new Date(item.latest_submission_date).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="right-tab col-flex">
                    {/* Comments Tab */}
                    <h3>Your Comments</h3>
                    <div className={`card-container comment navTab col-flex ${nav === "comments" ? "active" : ""}`}>
                        {fetchComment.map((item, index) => (
                            <div key={index} className="submission-card col-flex">
                                <p className="view">{item.comment}</p>
                                <p className="view"><strong>Date: </strong> {item.date}</p>
                            </div>
                        ))}
                    </div>

                    {/* Conditionally render "Submit Comment" button if any candidate's submission date is not today */}
                    {showCommentButton && (
                        <div className="comment-section row-flex">
                            <input 
                                type="text" 
                                placeholder="Enter Your Comment Here" 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <button className="submit-comment-btn" onClick={handleSubmitComment}>
                                Submit
                            </button>
                        </div>
                    )}

                    <button className="close-modal" onClick={onClose}>+</button>
                </div>
            </div>
        </div>
    );
};

export default CandidateDetailsModal;
