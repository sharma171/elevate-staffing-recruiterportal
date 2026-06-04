import React, { useEffect, useState } from 'react'
import "./sidebarStyle.css";
import IconSideNav from "../../images/icon-sidenav.svg";
import EditIcon from "../../images/edit-icon.svg";
import UserIcon from "../../images/user-icon.svg";
import user from "../../images/user.svg";
import FileMain from "../../images/main-file.svg";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Date_marketing from "../../images/marketingdateIcon.svg";
import sub from "../../images/submissions.svg";


function SidebarNavComponent(candidateDetails) {
    console.log("candidateDetails",candidateDetails);
    
    // const [navhead, setNavhead] = useState('tab1');
        const navigate = useNavigate();
            const [isOpen, setIsOpen] = useState(true);
        
    

    // const SidebarData = [
    //     { tab: 'tab1', title: 'Candidate Info', icon: "" },
    //     { tab: 'tab2', title: 'Files and Documents', icon: "" },
    //     { tab: 'tab3', title: 'Marketing Details', icon: "" },
    //     { tab: 'tab4', title: 'Submission Details', icon: "" },
    // ];

    // const handleNav = (tab) => {
    //     setNavhead(tab);

    // };

    function candiditeInfo() {
        navigate("/benchCandeidate");
    }

    return (
        <>
            <nav className='sidebar-nav'>
                <div className='info-cand'>
                    <div className='candinfo'>
                        <img className='icon' src={IconSideNav} alt="" srcset="" />
                        <p> Bench Candidate</p>
                        <button>
                            <img src={EditIcon} alt="" srcset="" />
                            edit</button>
                    </div>
                    <div className='userinfo'>
                        <img className='icon1' src={UserIcon} alt="" srcset="" />
                        <div className='userName'>Charitha{candidateDetails.first_name}</div>
                        <div className='userEmial'>charitha26.c@gmail.com</div>
                    </div>
                </div>
                <ul className='innercomponent'>
                    <div className={`sidebar-data ${isOpen ? 'open' : 'closed'}`}>
                    <img className='icon' src={user} alt="" srcset="" />
                    Candidate Info</div>
                    <div className={`sidebar-data ${isOpen ? 'open' : 'closed'}`}>
                    <img className='icon1' src={FileMain} alt="" srcset="" />
                    Files & Documents</div>
                    <div className={`sidebar-data ${isOpen ? 'open' : 'closed'}`}>
                    <img className='icon1' src={Date_marketing} alt="" srcset="" />
                    Marketing Details</div>
                    <div className={`sidebar-data ${isOpen ? 'open' : 'closed'}`}>
                    <img className='icon1' src={sub} alt="" srcset="" />
                    Submission Details</div>
                    {/* {SidebarData?.map((item, index) => (
                    <li key={index} className={navhead === item.tab ? 'active' : ''} onClick={() => handleNav(item.tab)}>
                        <a className='main-sidenav-data'href={item.path}>
                            {item.icon}
                            {item.title}
                        </a>
                    </li>
                ))} */}
                </ul>
            </nav>

        </>
    )
}

export default SidebarNavComponent