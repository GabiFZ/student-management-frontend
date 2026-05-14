import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import axios from "axios";


const EditStudent = () => {

    let navigate = useNavigate();

    const {id} = useParams();

    const [student, setStudent] = useState({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        email: "",
        age:   "",
        studentNumber: "",
        department: { id: "" }

    });

    const{firstName, lastName, username, password,  email,age, studentNumber,  department} = student;


    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        const result = await axios.get(`http://localhost:8080/students/${id}`);
        setStudent(result.data);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "department") {
            setStudent({
                ...student,
                department: { id: value }
            });
        } else {
            setStudent({
                ...student,
                [name]: value
            });
        }
    };
    const updateStudent = async (e) => {
        e.preventDefault();
        await axios.put(`http://localhost:8080/students/${id}`,
            student
        );

        navigate("/view-students");
    };



    return (
        <div className='col-sm-8 py-2 px-5 offset-2 shadow'>
            <h2 className='mt-5'>Edit Student</h2>
            <form onSubmit = {(e) => updateStudent(e)} >
                <div className='input-group mb-5'>
                    <label className='input-group-text' htmlFor='firstName'>
                        First Name
                    </label>
                    <input className='form-control col-sm-6' type='text' name='firstName' id='firstName' required value={firstName} onChange={(e) => handleInputChange(e)} />


                </div>

                <div className='input-group mb-5'>
                    <label className='input-group-text' htmlFor='lastName'>
                        Last Name
                    </label>
                    <input className='form-control col-sm-6' type='text' name='lastName' id='lastName' required value={lastName} onChange={(e) => handleInputChange(e)} />


                </div>

                <div className='input-group mb-5'>
                    <label className='input-group-text' htmlFor='username'>
                        User Name
                    </label>
                    <input className='form-control col-sm-6' type='text' name='username' id='username' required value={username} onChange={(e) => handleInputChange(e)} />


                </div>

                <div className='input-group mb-5'>
                    <label className='input-group-text' htmlFor='password'>
                        Password
                    </label>
                    <input className='form-control col-sm-6' type='password' name='password' id='password' required value={password} onChange={(e) => handleInputChange(e)} />


                </div>


                <div className='input-group mb-5'>
                    <label className='input-group-text' htmlFor='email'>
                        Your Email
                    </label>
                    <input className='form-control col-sm-6' type='email' name='email' id='email' required value={email} onChange={(e) => handleInputChange(e)} />


                </div>

                <div className='input-group mb-5'>
                    <label className='input-group-text' htmlFor='age'>
                        Age
                    </label>
                    <input
                        className='form-control col-sm-6'
                        type='number'
                        name='age'
                        id='age'
                        required
                        value={age}
                        onChange= {(e) => handleInputChange(e)} />

                </div>

                <div className='input-group mb-5'>
                    <label className='input-group-text' htmlFor='studentNumber'>
                        Student Number
                    </label>
                    <input className='form-control col-sm-6' type='text' name='studentNumber' id='studentNumber' required value={studentNumber} onChange={(e) => handleInputChange(e)} />


                </div>

                <div className='input-group mb-5'>
                    <label className='input-group-text' htmlFor='department'>
                        Department
                    </label>
                    <input className='form-control col-sm-6' type='text' name='department' id='department' required value={department.id} onChange={(e) => handleInputChange(e)} />


                </div>

                <div className='row mb-5'>
                    <div className='col-sm-2'>
                        <button
                            type='submit'
                            className='btn  btn-outline-success btn-lg'>
                            Save
                        </button>


                    </div>

                    <div className='col-sm-2'>
                        <Link to={"/view-students"}
                              type='submit'
                              className='btn  btn-outline-warning btn-lg'>
                            Cancel
                        </Link>
                    </div>
                </div>

            </form>

        </div>
    )


}

export default EditStudent;