import React from 'react'

import Logo1 from "../../../assets/TimeLineLogo/Logo1.svg"
import Logo2 from "../../../assets/TimeLineLogo/Logo2.svg"
import Logo3 from "../../../assets/TimeLineLogo/Logo3.svg"
import Logo4 from "../../../assets/TimeLineLogo/Logo4.svg"
import man from '../../../assets/Images/man.png'

import Img from './../../common/Img';

import { motion } from 'framer-motion'
import { fadeIn } from '../../common/motionFrameVarients';



const timeline = [
    {
        Logo: Logo1,
        heading: "Autocunoaștere",
        Description: "Dezvoltă o relație autentică cu tine însuți prin exerciții de reflecție și mindfulness",
    },
    {
        Logo: Logo2,
        heading: "Echilibru emoțional",
        Description: "Învață să gestionezi stresul și emoțiile pentru a menține armonia în viața ta personală și profesională",
    },
    {
        Logo: Logo3,
        heading: "Claritate mentală",
        Description: "Folosește instrumente practice și tehnici de meditație ghidată pentru a-ți recăpăta focusul și energia",
    },

    {
        Logo: Logo4,
        heading: "Dezvoltare continuă",
        Description: "Urmează un parcurs structurat care te sprijină să evoluezi constant, pas cu pas",
    },
];

const TimelineSection = () => {
    return (
        <div>
            <div className='flex flex-col lg:flex-row gap-15 items-center'>

                <motion.div
                    variants={fadeIn('right', 0.1)}
                    initial='hidden'
                    whileInView={'show'}
                    viewport={{ once: false, amount: 0.1 }}
                    className='w-full lg:w-[45%] flex flex-col gap-5 mr-10'>
                    {
                        timeline.map((element, index) => {
                            return (
                                <div className='flex flex-row gap-6' key={index}>

                                    <div className='w-[50px] h-[50px] flex justify-center items-center'>
                                        <img src={element.Logo} />
                                    </div>

                                    <div>
                                        <h2 className='font-semibold text-[18px]'>{element.heading}</h2>
                                        <p className='text-base'>{element.Description}</p>
                                    </div>

                                </div>
                            )
                        })
                    }
                </motion.div>

                <motion.div
                    variants={fadeIn('left', 0.1)}
                    initial='hidden'
                    whileInView={'show'}
                    viewport={{ once: false, amount: 0.1 }}
                    className='relative shadow-blue-200'>

                    <Img src={man}
                        alt="man reading"
                        className='shadow-white object-cover h-fit scale-x-[-1] w-[550px] mt-10'
                    />

                    <div className=' absolute bg-brand-primary  flex flex-row text-white uppercase py-7
                            left-[50%] translate-x-[-50%] translate-y-[-70%] rounded-3xl'>
                        <div className='flex flex-row gap-5 items-center border-r border-white px-7'>
                            <p className='text-2xl lg:text-3xl font-bold'>10</p>
                            <p className='text-white text-xs lg:text-sm'>Years of Experience</p>
                        </div>

                        <div className='flex gap-5 items-center px-7'>
                            <p className='text-2xl lg:text-3xl font-bold'>250</p>
                            <p className='text-white text-xs lg:text-sm'>TYpe of Courses</p>
                        </div>

                    </div>

                </motion.div>
            </div>
        </div>
    )
}

export default TimelineSection
