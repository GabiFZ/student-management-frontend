import React, { useEffect, useState } from "react";
import {Link, useParams} from "react-router-dom";
import axios from "axios";

const StudentProfile = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);

    useEffect(() => {
        const loadStudent = async () => {
            const res = await axios.get(`http://localhost:8080/students/${id}`);
            setStudent(res.data);
        };
        loadStudent();
    }, [id]);

    if (!student) return <div>Loading...</div>;

    return (
        <div className="container">
            <div className="main-body">
                <nav aria-label="breadcrumb" className="main-breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/" className="text-decoration-none fw-semibold"
                                  style={{ color: '#6c757d', cursor: 'pointer' }} >Home</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            Student Profile
                        </li>
                    </ol>
                </nav>

                <div className="row gutters-sm">
                    <div className="col-md-4 mb-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex flex-column align-items-center text-center">
                                    <img
                                        src="https://bootdey.com/img/Content/avatar/avatar4.png"
                                        alt="Student"
                                        className="rounded-circle"
                                        width="150"
                                    />
                                    <div className="mt-3 text-center">
                                        <h4>{student.firstName} {student.lastName}</h4>
                                        <p className="text-secondary mb-1">{student.username}</p>
                                        <p className="text-muted font-size-sm">{student.email}</p>
                                        <div className="d-flex justify-content-center gap-2 mt-2">
                                            <button className="btn  btn-outline-success ">Call</button>
                                            <button className="btn btn-outline-warning ">Message</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="card mb-3">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-sm-3"><h6>Full Name</h6></div>
                                    <div className="col-sm-9 text-secondary">{student.firstName} {student.lastName}</div>
                                </div>
                                <hr />
                                <div className="row">
                                    <div className="col-sm-3"><h6>Email</h6></div>
                                    <div className="col-sm-9 text-secondary">{student.email}</div>
                                </div>
                                <hr />
                                <div className="row">
                                    <div className="col-sm-3"><h6>Age</h6></div>
                                    <div className="col-sm-9 text-secondary">{student.age}</div>
                                </div>
                                <hr />
                                <div className="row">
                                    <div className="col-sm-3"><h6>Student Number</h6></div>
                                    <div className="col-sm-9 text-secondary">{student.studentNumber}</div>
                                </div>
                                <hr />
                                <div className="row">
                                    <div className="col-sm-3"><h6>Department</h6></div>
                                    <div className="col-sm-9 text-secondary">{student.department.name}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;