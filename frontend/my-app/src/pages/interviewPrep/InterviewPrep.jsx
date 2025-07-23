import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment';
import {AnimatePresence, motion} from 'framer-motion';
import { LuCircleAlert, LuListCollapse } from 'react-icons/lu';
import SpinnerLoader from '../../components/loader/SpinnerLoader';
import {toast} from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import RoleInfoHeader from './components/RoleInfoHeader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import QuestionCard from '../../components/cards/QuestionCard';
import AIResponsePreview from './components/AIResponsePreview';
import Drawer from '../../components/Drawer';
import SkeletonLoader from '../../components/loader/SkeletonLoader';

const InterviewPrep = () => {
  const {sessionId} = useParams();
  const [sessionData, setSessionData] = useState(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [openLearnMoredrawer, setOpenLearnMoredrawer] = useState(false);
  const [explanation, setExplanation] = useState(null); // [title, explanation,]
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatedLoader, setIsUpdatedLoader] = useState(false);

  //Fetch session data by session id
  const fetchSessionDetailsById = async () =>{
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));
      if(response.data && response.data.session){
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
    }
  }
  //Generate concept explanation
  const generateConceptExplanation = async (question) => {
    try {

      setErrorMsg("");
      setExplanation(null);
      setIsLoading(true);
      setOpenLearnMoredrawer(true);
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_EXPLANATION, {question},{timeout: 20000});
      
      if(response.data){
        setExplanation(response.data[0]);
        console.log(explanation);

      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg("Failed to generate explanation, Try again later");
      console.error("Error generating explanation:", error);
      toast.error("Failed to generate explanation, Try again later");
    }finally{
      setIsLoading(false);
    }
  }

  // Pin Question
  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId));
      console.log(response);
      if(response.data && response.data.success){
        toast.success("Question toggled successfully");
        fetchSessionDetailsById();
      }
    } catch (error) {
      console.error("Error pinning question:", error);
    }
  }

  // Add more questions to a session
  const uploadMoreQuestions = async ()=>{
    try {
      setIsUpdatedLoader(true);
      //call AI API to generate questions
      const aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS,{
        role: sessionData?.role,
        experience: sessionData?.experience,
        topicsToFocus: sessionData?.topicsToFocus,
        numberOfQuestions: 10,
      },{
        timeout: 30000  // Increase timeout to 30 seconds (30000ms)
      })
      //should be array like [{question, answer}, ....]
      const generatedQuestions = aiResponse.data;
      const response = await axiosInstance.post(API_PATHS.QUESTION.ADD_TO_SESSION,{sessionId, questions:generatedQuestions})
      if(response.data){
        toast.success("Added more Q & A successfully");
        fetchSessionDetailsById();
      }
    } catch (error) {
      if(error.response && error.response.data.message){
        setErrorMsg(error.response.data.message);
      }else{
        setErrorMsg("Something went wrong. Please try again.");
      }
    }finally{
      setIsUpdatedLoader(false);
    }
  }

  useEffect(()=>{
    if(sessionId){
      fetchSessionDetailsById();
    }
  },[])

  return (
    <DashboardLayout>
      <RoleInfoHeader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience || "-"}
        questions = {sessionData?.questions?.length || "-"}
        description={sessionData?.description || ""}
        lastUpdated={sessionData?.updatedAt ? 
          moment(sessionData?.updatedAt).format("Do MMM YYYY")
          : ""
        }
      />
      <div className='container mx-auto pt-4 pb-4 px-4 md:px-0'>
        <h2 className='text-lg font-semibold color-black'>Interview Q & A </h2>
        <div className='grid grid-cols-12 gap-4 mt-5 mb-10'>
          <div className={`col-span-12 ${openLearnMoredrawer ? "md:col-span-7" : "md:col-span-8"}`}>
            <AnimatePresence>
              {sessionData?.questions?.map((data, index)=>{
                return(
                  <motion.div
                    key={data._id || index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 0.95 }}
                    transition = {{
                      duration: 0.4,
                      type: "spring",
                      stiffness: 100,
                      delay: index * 0.1,
                      damping: 15
                    }}
                    layout // this is the key prop that animates position changes
                    layoutId={`question-${data._id || index}`} // Helps framer motion tracks specific items
                  >
                    <>
                      <QuestionCard
                        question={data?.question}
                        answer={data?.answer}
                        onLearnMore={()=>
                          generateConceptExplanation(data.question)
                        }
                        isPinned={data?.isPinned}
                        onTogglePin = {()=>toggleQuestionPinStatus(data._id)}
                      />
                    
                    {!isLoading && 
                        sessionData?.questions?.length === index+ 1 && (
                          <div className='flex items-center justify-center mt-5'>
                            <button 
                              className='flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer'
                              disabled={isLoading || isUpdatedLoader}
                              onClick={uploadMoreQuestions}
                            >
                              {isUpdatedLoader ? (
                                <SpinnerLoader/>
                              ) : (
                                <LuListCollapse className='text-lg'/>
                              )
                              }{" "}
                              Load More
                            </button>
                          </div>
                        )
                    }
                    </>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
        <div>
          <Drawer
            isOpen={openLearnMoredrawer}
            onClose={()=>setOpenLearnMoredrawer(false)}
            title={explanation?.title}  
          >
            {errorMsg && (
              <p className='flex gap-2 text-sm text-amber-600 font-medium'>
                <LuCircleAlert className='mt-1'/> {errorMsg}
              </p>
            )}
            {isLoading && <SkeletonLoader/>}
            {!isLoading && explanation && (
              <AIResponsePreview content={explanation?.explanation}/>
            )}
          </Drawer>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default InterviewPrep