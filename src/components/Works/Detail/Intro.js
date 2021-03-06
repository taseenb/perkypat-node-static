import React from 'react'
import Head from './Intro/Head'
import Credits from './Intro/Credits'
import Description from './Intro/Description'

export default function Intro (props) {
  const { displayName, title } = props

  return (
    <div className='intro row no-gutters py-md-4 px-md-4'>
      <div className='col-12'>
        <div className='row no-gutters align-items-end'>
          <div className='col-12 col-md-8'>
            <Head {...props} />
          </div>

          <div className='py-2 px-2 pl-md-2 pr-md-4 py-md-0 col-12 col-md-4'>
            <Credits {...props} />
          </div>
        </div>

        <div className='row no-gutters mt-md-4'>
          <div className='py-2 px-2 px-md-0 py-md-0 col-12 col-md-8'>
            <div className='text'>
              <div className='inner'>
                <span className='title'>{title || displayName}</span>

                {/* <span className="year">2015</span>  */}

                <Description {...props} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
