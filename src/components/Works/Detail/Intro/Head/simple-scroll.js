import React, { useState } from 'react'
import Img from '../../../../shared/Img'
import ErrorImg from '../../../../shared/ErrorImg'
import LoadingAnimation from '../../../../shared/LoadingAnimation'

const cache = []

export default function SimpleScroll ({ displayName, title, head }) {
  const { src, dimensions } = head.image
  const [loaded, setLoaded] = useState(cache[src])
  const [error, setError] = useState(false)

  function onLoad () {
    // console.log('image in simple scroll loaded')
    cache[src] = true
    setLoaded(true)
  }

  function onError () {
    // console.log('image in simple scroll loaded')
    setError(true)
    setLoaded(false)
  }

  return (
    <div className='head'>
      {/* <div className='glass overlay abs-percent-fullscreen'></div> */}
      <div className='border overlay abs-percent-fullscreen'></div>

      <LoadingAnimation show={!loaded && !error} />

      {error ? (
        <ErrorImg />
      ) : (
        <div className='simple-scroll'>
          <Img
            className='simple-scroll-img'
            dimensions={dimensions}
            src={src}
            alt={title || displayName}
            lazy={false}
            showLoading={false}
            showError={false}
            onLoad={onLoad}
            onError={onError}
          />
        </div>
      )}
    </div>
  )
}
