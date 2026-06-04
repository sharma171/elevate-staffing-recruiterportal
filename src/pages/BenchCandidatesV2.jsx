import React, { useEffect, useState } from 'react'
import makeRequest from '../helpers/http-request';
import { BenchCandidatesHeaders } from '../assets/data/TableHeaders';
import Table from '../components/Table';
import Edit from '../assets/images/Edit.svg';
import Delete from '../assets/images/Delete.svg';
import Close from '../assets/images/Close.svg';
import Male from '../assets/images/Male.svg';
import Female from '../assets/images/Female.svg';
import OverlayModal from '../components/OverlayModal';
import ConfirmationDialogBox from '../components/ConfirmationDialogBox';
import DropDown from '../components/DropDown';
import MaleImage from '../assets/images/MaleImg.png';
import FemaleImg from '../assets/images/FemaleImg.png';
import Loader from '../components/Loader';
import Prev from '../assets/images/Prev.svg';
import Next from '../assets/images/Next.svg';

import '../assets/styles/BenchCandidatev2.css';

const BenchCandidatesV2 = () => {
    const [isModalActive, setIsModalActive] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [data, setData] = useState([]);
    const [recruiters, setRecruiters] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [confirm, setConfirm] = useState(false);
    const [priorityFilter, setPriorityFilter] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedRecruiter, setSelectedRecruiter] = useState(null);
    const [selectedVisa, setSelectedVisa] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [isPageLoad, setIsPageLoad] = useState(true);
    const [filterdCandidates, setFilteredCandidates] = useState([]);
    const [selectedSearch, setSelectedSearch] = useState("");
    const[selectedTeam, setSelectedTeam] = useState(null);
    const [pageCount, setPageCount] = useState(1);
    let pageLimit = 5;


    const getRecruiters = async () => {
        try{

            const url = "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3"

            const options = {
                url,
                method:"POST",
                data : {
                    emailid : "mat@4spheresolutions.com",
                    operation : "retrieve"
                }
            }

            const res = await makeRequest(options);
            if(res?.status == 200){
                let arr = res?.data?.data.map((value)=>{
                    return {
                        value : value?.recruiter_alias_name,
                        text : value?.recruiter_alias_name
                    }
                })
                setRecruiters(arr);
            }

            console.log("recruiters", res?.data?.data)

        }catch(err){
            console.log(err);
        }
    }

    const getCandidates = async () => {
        try{
            const url = "https://us-east1-recruiterportal.cloudfunctions.net/Fetch_Update_Bench_Candidates_v3"

            const options = {
                url,
                method : "POST",
                data : {
                    emailid : "mat@4spheresolutions.com",
                    role : "admin"
                }
            }

            const res = await makeRequest(options);
            if(res?.status == 200){
                const data = Object.entries(res?.data).map(([key, value])=>{
                    const id = key.split(": ")[1];
                    return {
                        id,
                        ...value
                    }
    
                });
    
                setCandidates(data);
                console.log(data);
            }
            setIsPageLoad(false);
            
        }catch(err){
            console.log(err);
        }
    }

    const handleClearFilters = () => {
        setSearch("");
        setSelectedStatus(null);
        setSelectedRecruiter(null);
        setSelectedTeam(null);
        setPriorityFilter(null);
      };
    
   useEffect(()=>{
    getRecruiters();
    getCandidates();
   },[])

   useEffect(()=>{
    let filtered = candidates;

    if(search){
        filtered = filtered.filter((value)=>{
            return (value?.first_name + value?.last_name).toLowerCase().includes(search.toLowerCase());
        })
    }

    if(selectedStatus){
        console.log("Entered into if")
        filtered = filtered.filter((value)=>value?.current_status == selectedStatus.value)
    }

    if(priorityFilter){
        filtered = filtered.filter((value)=>value?.priority == priorityFilter.value);
    }

    if(selectedVisa){
        filtered = filtered.filter((value)=>value?.cvisa_status == selectedVisa.value);
    }

    if(selectedRecruiter){
        filtered = filtered.filter((value)=> value?.assigned_recruiter == selectedRecruiter.value);
    }


    const startIndex = (pageCount-1)*pageLimit;
    const endIndex = pageCount * pageLimit;
    setFilteredCandidates(filtered.slice(startIndex, endIndex));
   },[selectedStatus, priorityFilter, selectedVisa, selectedSearch, selectedRecruiter, search, candidates, pageCount]);

   const handlePaginationNext = () => {
        if(pageCount <= Math.ceil(filterdCandidates.length / pageLimit)){
        setPageCount(pageCount+1);
    }
    }

  const handlePaginationPrev = () => {
    if(pageCount > 1 ){
      setPageCount(pageCount-1);
    }
  }
    
  return (
    <div className="width-100 vh-100 org-details-main">
        <div className="org-details-container d-flex justify-end">
            <div className="org d-flex flex-column justify-start align-start">
            <ul className="org-top-element d-flex gap-1">
                <li
                className="org-element-active org-element"
                >
                Bench Candidates
                </li>
            </ul>
                <div className="org-body width-100">
                    <div>
                    <div className="v2-btn-container d-flex justify-end mb-2">
                        <div className="width-100 d-flex align-center gap-4">
                        <div className="teams-input">
                            <input
                            value={search}
                            type="search"
                            placeholder="search by teams"
                            onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="teams-dropDown-container">
                            <DropDown
                            selected={selectedVisa}
                            setSelected={setSelectedVisa}
                            data={[
                                { value: "OPT", text: "OPT" },
                                { value: "CPT", text: "CPT" },
                                { value: "H1B", text: "H1B" },
                                { value: "H4 EAD", text: "H4 EAD" },
                                { value: "GC", text: "GC" },
                                { value: "GC EAD", text: "GC EAD" },
                                { value: "USC", text: "USC" },
                                { value: "STEM OPT", text: "STEM OPT" }
                            ]}
                            text="Filter by  visa"
                            />
                        </div>
                        <div className="teams-dropDown-container">
                            <DropDown
                            selected={selectedRecruiter}
                            setSelected={setSelectedRecruiter}
                            data={recruiters}
                            text="Filter by recruiter"
                            />
                        </div>
                        {/* <div className="teams-dropDown-container">
                            <DropDown
                            selected={selectedTeam}
                            setSelected={setSelectedTeam}
                            data={teamsDropDown}
                            text="Filter by team"
                            />
                        </div> */}
                        <div className="teams-dropDown-container">
                            <DropDown
                            selected={selectedStatus}
                            setSelected={setSelectedStatus}
                            data={[
                                { value: "Active", text: "Active" },
                                { value: "Inactive", text: "Inactive" },
                            ]}
                            text="Filter by status"
                            />
                        </div>
                        <div className="teams-dropDown-container">
                            <DropDown
                            selected={priorityFilter}
                            setSelected={setPriorityFilter}
                            data={[
                                { value: "High", text: "High" },
                                {value : "Medium", text: "Medium"},
                                { value: "Low", text: "Low" },
                            ]}
                            text="Filter by priority"
                            />
                        </div>
                        <div className="clear-filters">
                            <button className="cursor-pointer" onClick={handleClearFilters}>
                            Clear filters
                            </button>
                        </div>
                        </div>
                        <button
                        className="v2-btn cursor-pointer"
                        onClick={() => setIsModalActive(true)}
                        >
                        Create
                        </button>
                    </div>
                    {!isPageLoad ? (<Table headers={BenchCandidatesHeaders}>
                            {filterdCandidates?.map((value, index)=>(
                                <tr key={value.id}  className="v2-table-body">
                                    {/* <td>{index+1}</td> */}
                                    <td>
                                        <div className='d-flex align-center gap-3'>
                                            <img className='v2-male-icon' src={value.gender == "Male" ? MaleImage : FemaleImg}/>
                                        {`${value.first_name} ${value.last_name}`}
                                        </div>
                                    </td>
                                    <td>{value.primary_email}</td>
                                    <td>{value.cvisa_status}</td>
                                    <td>{value.priority ? value.priority : "null"}</td>
                                    <td className={`${value.current_status == "Active" ? "table-status-success" : "table-status-warning"} table-status`}>{value.current_status}</td>
                                    <td>
                                        <div className="v2-table-actions d-flex justify-evenly align-center">
                                            <img
                                            className="cursor-pointer"
                                            src={Edit}
                                            // onClick={() => handleUpdateRecruiter(value?.details[0])}
                                            />
                                            <img
                                            className="cursor-pointer"
                                            src={Delete}
                                            onClick={()=>setShowDialog(true)}
                                            // onClick={() => handleDeleteTeam(value?.details[0].id)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>) : (
                            <div className="d-flex justify-center  align-center loader-container">
                            <Loader
                              style={{
                                borderColor: "#6115BE",
                                width: "30px",
                                height: "30px",
                              }}
                            />
                          </div>
                        )} 
                    </div>
                    <div className="d-flex justify-end align-center gap-4 mt-2">
                        <button className="v2-page-btn" onClick={()=>handlePaginationPrev()}>
                        <img src={Prev}/>
                        </button>
                        <p>{pageCount}</p>
                        <button className="v2-page-btn" onClick={()=>handlePaginationNext()}>
                        <img src={Next}/>
                        </button>
                    </div>
                </div>
                {isModalActive && (
                    <OverlayModal isActive={isModalActive}>
                    <div className="org-btn-container d-flex flex-column justify-start gap-3">
                        <div
                        className="d-flex justify-end cursor-pointer"
                        onClick={() => {
                            setIsModalActive(false) 
                            // resetState()
                        }}
                        >
                        <img src={Close} />
                        </div>
                        {/* <p className="v2-heading">{update ? "Update Team" : "Add Team"}</p>
                        <div>
                        <label>Team Name</label>
                        <input
                            className=""
                            value={input}
                            placeholder="Enter team name"
                            onChange={(e) => setInput(e.target.value)}
                        />
                        {error && <p className="v2-login-error">{error}</p>}
                        </div>
                        {update && <div>
                        <label>Team status</label>
                        <DropDown
                            style={{padding : "10px"}}
                            selected={statusUpdate}
                            setSelected={setStatusUpdate}
                            text="Select status"
                            data={[
                            { value: true, text: "Active" },
                            { value: false, text: "Inactive" },
                            ]}
                        />
                        </div>}
                        <div className="d-flex justify-end">
                        <button
                            className={`v2-btn ${
                            isLoading && "v2-btn-loader"
                            } d-flex justify-center cursor-pointer`}
                            onClick={update ? updateTeam : addTeam}
                        >
                            {isLoading ? <Loader /> : update ? "Update Team" : "Add Team"}
                        </button>
                        </div> */}
                    </div>
                    </OverlayModal>
                )}

                {showDialog && (
                    <ConfirmationDialogBox
                    isLoading={isLoading}
                    confirm={confirm}
                    setConfirm={setConfirm}
                    onConfirm={() => {
                        // deleteTeam(deleteId);
                    }}
                    onCancel={() => {
                        setShowDialog(false);
                    }}
                    text="Do you permanently want to delete this?"
                    />
                )}
            </div>
        </div>
    </div>
  )
}

export default BenchCandidatesV2