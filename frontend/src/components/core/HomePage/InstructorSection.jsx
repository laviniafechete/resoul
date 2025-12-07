import React from 'react'
import Instructor from '../../../assets/Images/mentor.png'
import HighlightText from './HighlightText'
import CTAButton from "../HomePage/Button"
import { FaArrowRight } from 'react-icons/fa'
import Img from './../../common/Img';


import { motion } from 'framer-motion'
import { scaleUp } from './../../common/motionFrameVarients';


const InstructorSection = () => {
  return (
    <div>
      <div className='flex flex-col-reverse lg:flex-row gap-10 lg:gap-20 items-center'>

        <motion.div
          variants={scaleUp}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.1 }}
          className='lg:w-[50%] '>
          <Img
            src={Instructor}
            alt="Instructor"
            className='shadow-white rounded-3xl'
          />
        </motion.div>

        <div className='lg:w-[50%] flex flex-col'>
          <div className='text-3xl lg:text-4xl font-semobold w-[50%] mb-2'>
            Devino mentor
          </div>

          <p className='font-medium text-[16px] w-[80%] text-richblack-300 mb-12'>
          Inspiră, ghidează și ajută alți oameni să își regăsească liniștea și direcția.
          Prin platforma noastră, poți transforma pasiunea ta pentru dezvoltare personală și mindfulness într-un impact real în viețile celorlalți.          </p>

          <div className='w-fit'>
            <CTAButton active={true} linkto={"/signup"}>
              <div className='flex flex-row gap-2 items-center'>
              Începe ca mentor
                <FaArrowRight />
              </div>
            </CTAButton>
          </div>
        </div>

      </div>
    </div>
  )
}

export default InstructorSection
