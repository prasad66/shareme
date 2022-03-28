/* eslint-disable no-useless-concat */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { MdDownloadForOffline } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid';
import { client, urlFor } from '../client';
import { pinDetailMorePinQuery, pinDetailQuery } from '../utils/data';
import MasonryLayout from './MasonryLayout';
import Spinner from './Spinner';

const PinDetail = ({ user }) => {

  const [pins, setPins] = useState(null);
  const [pinDetail, setPinDetails] = useState(null);
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  const { pinId } = useParams();

  const fetchPinDetails = () => {

    let query = pinDetailQuery(pinId);

    if (query) {
      // fetching the current pin details
      client.fetch(query)
        .then((data) => {
          setPinDetails(data[0]);

          // fetching the more pins similar to the current pin
          if (data[0]) {
            query = pinDetailMorePinQuery(data[0]);

            client.fetch(query)
              .then((res) => { setPins(res) });
          }

        })


    }

  }

  useEffect(() => {
    fetchPinDetails();
  }, [pinId]);


  const addComment = () => {
    if (comment) {

      setAddingComment(true);

      client
        .patch(pinId)
        .setIfMissing({ comments: [] })
        .insert('after', 'comments[-1]', [{
          comment,
          _key: uuidv4(),
          postedBy: {
            _type: 'postedBy',
            _ref: user._id,
          }
        }])
        .commit()
        .then(() => {
          console.log('done')
          fetchPinDetails();
          setAddingComment(false);
          setComment('');

        })


    }
  }

  if (!pinDetail) return <Spinner message="Loading post..." />
  return (
    <>
      <div className="flex xl-flex-row flex-col m-auto bg-white" style={{ maxWidth: '1500px', borderRadius: '32px' }}>
        <div className="flex justify-center items-center md:items-start flex-initial">
          <img
            src={pinDetail?.image?.asset?.url && urlFor(pinDetail.image).url()}
            alt=""
            className='rounded-t-3xl rounded-b-lg'
          />
        </div>
        <div className="w-full p-5 flex-1 xl:min-w-62">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <a
                href={`${pinDetail.image.asset.url}?dl=`}
                download
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="bg-white w-9 h-9 p-2 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
              ><MdDownloadForOffline />
              </a>
            </div>
            <a href={pinDetail?.destination} target="_blank" rel="noopener noreferrer" className="bg-white shadow-md p-2 rounded-lg hover:scale-105 ease-in-out transition duration-150 ">
              {pinDetail?.destination}
            </a>
          </div>
          <div>
            <h1 className="text-4xl font-bold break-words mt-3">
              {pinDetail?.title}
            </h1>
            <p className="mt-3">
              {pinDetail?.about}
            </p>
          </div>
          <Link to={`/user-profile/${pinDetail?.postedBy?._id}`} className="flex gap-2 mt-5 items-center bg-white rounded-lg">
            <img
              className="w-8 h-8 rounded-full object-cover"
              src={pinDetail?.postedBy?.image}
              alt="user-profile"
            />
            <p className="font-semibold capitalize">{pinDetail?.postedBy?.userName}</p>
          </Link>
          <h2 className="mt-5 text-2xl">Comments</h2>
          <div className="max-h-370 overflow-y-auto">
            {
              pinDetail?.comments?.map((comment, index) => (
                <div className="flex gap-2 mt-5 items-center bg-whit rounded-lg" key={index}>
                  <img
                    className="w-10 h-10 rounded-full object-cover"
                    src={comment.postedBy.image}
                    alt="user-profile"
                  />
                  <div className="flex flex-col">
                    <p className="font-bold">
                      {comment.postedBy.userName}
                    </p>
                    <p>{comment.comment}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* comment creation */}

          <div className="flex flex-wrap mt-6 gap-3">
            <Link to={`/user-profile/${pinDetail?.postedBy?._id}`} className="flex gap-2 items-center bg-white rounded-lg">
              <img
                className="w-10 h-10 rounded-full cursor-pointer"
                src={user?.image}
                alt="user-profile"
              />
            </Link>
            <input
              type="text"
              className="flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => { setComment(e.target.value) }}
            />
            <button
              type="button"
              className={' px-6 py-2 rounded-full font-semibold text-base outline-none ' + `${comment?.length > 0 ? 'bg-red-500 text-white cursor-pointer' : 'bg-red-300 cursor-not-allowed text-gray-500'}`}
              disabled={comment ? false : true}
              onClick={addComment}
            >
              {addingComment ? 'Posting...' : 'Post'}
            </button>
          </div>

        </div>
      </div>

      {
        pins?.length > 0 ? (
          <>
            <h2 className="text-center font-bold text-2x mt-8 mb-4">
              More like this
            </h2>
            <MasonryLayout pins={pins} />
          </>
        ) : (
          <Spinner message="Loading more pins..." />
        )
      }
    </>
  )
}

export default PinDetail

