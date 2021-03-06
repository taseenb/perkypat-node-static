import React from 'react'
import PropTypes from 'prop-types'
import ListItem from './Works/ListItem'

function Works ({ works, shared, show }) {
  return (
    <div id='works' className={show ? 'show' : ''}>
      <div className='works-inner row no-gutters py-md-4 px-md-4 px-2 py-2 px-sm-4'>
        <div className='col-12 col-md-8'>
          <div className='spacer' />
          <div className='inner row'>
            {works.map(work => {
              return <ListItem key={work.uid} {...work} shared={shared} />
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

Works.propTypes = {
  works: PropTypes.array.isRequired,
  shared: PropTypes.object.isRequired
}

export default Works
