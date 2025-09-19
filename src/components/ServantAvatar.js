import React from 'react';
import '../avatar.css';
import { ReactComponent as AoESvg } from '../AoE.svg'; // Adjust the path as necessary
import { ReactComponent as SingleTargetSvg } from '../SingleTarget.svg'; // Adjust the path as necessary
import { ReactComponent as SupportSvg } from '../Support.svg'; // Adjust the path as necessary

const ServantAvatar = ({ bgType, servantFace, tagType }) => {

  let TagImage;
  switch (tagType) {
    case "attackEnemyAll":
      TagImage = AoESvg;
      break;
    case "attackEnemyOne":
      TagImage = SingleTargetSvg;
      break;
    case "support":
      TagImage = SupportSvg;
      break;
    default:
      TagImage = null; // don't show a tag for empty/unknown types
  }

  let bgImage;
  switch (bgType) {
    case "buster":
      bgImage = `${process.env.PUBLIC_URL}/busterbg.svg`;
      break;
    case "arts":
      bgImage = `${process.env.PUBLIC_URL}/artsbg.svg`;
      break;
    case "quick":
      bgImage = `${process.env.PUBLIC_URL}/quickbg.svg`;
      break;
    default:
      bgImage = null;
  }

  return (
    <div className="container">
      <div className="card">
        <div
          className="card-inner"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="box">
            <div className="imgBox">
              {servantFace ? (
                <img
                  src={servantFace}
                  className="custom-avatar"
                  alt="servant icon"
                />
              ) : (
                <div className="empty-avatar" aria-hidden="true" />
              )}
            </div>
            <div className="tag">
              {TagImage ? <TagImage className={"TagImage"} /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServantAvatar;