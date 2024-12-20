import React, { useEffect } from 'react'
import Button from '../atoms/Button'
import AOS from 'aos'

const Contact:React.FC = () => {
    useEffect(()=>{
        AOS.init({
          duration: 1000,
          offset: 100,
          easing: "ease-in-out",
          once: false,
        })
      })
  return (
    <div className='bg-secondary'>
        <div className='max-w-[1080px] mx-auto py-16 px-5'>
            <h5 data-aos="fade-right" className='text-3xl font-medium text-aksen'>Love to hear from you, <br /> Get it touch</h5>
            <form className='grid sm:grid-cols-2 mt-16 gap-5'>
                <div data-aos="fade-up">
                    <label>Nama</label>
                    <input type="text" placeholder='Username' className='mt-2 border rounded-md outline-none px-4 py-2 w-full' />
                </div>
                <div data-aos="fade-up">
                    <label>Email</label>
                    <input type="text" placeholder='email@gmail.com' className='mt-2 border rounded-md outline-none px-4 py-2 w-full' />
                </div>
                <div data-aos="fade-up" className='sm:col-span-2'>
                    <label>Pesan</label>
                    <textarea placeholder='Your message' className='mt-2 border rounded-md outline-none px-4 py-2 w-full min-h-[200px] max-h-[200px]' />
                </div>
                <div data-aos="fade-up" className='sm:col-start-2 flex items-center justify-end'>
                    <Button type='submit'>Kirim</Button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Contact