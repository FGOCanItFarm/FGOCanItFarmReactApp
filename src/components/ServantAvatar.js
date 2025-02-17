import React from 'react';
import '../avatar.css';
import { ReactComponent as AoESvg } from '../AoE.svg'; // Adjust the path as necessary
import { ReactComponent as SingleTargetSvg } from '../SingleTarget.svg'; // Adjust the path as necessary
import { ReactComponent as SupportSvg } from '../Support.svg'; // Adjust the path as necessary

const ServantAvatar = ({ bgType, servantFace = "https://static.atlasacademy.io/JP/Faces/f_28001003.png", tagType }) => {

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
      TagImage = SupportSvg;
  }

  let bgImage;
  switch (bgType) {
    case "buster":
      bgImage = "/busterbg.svg";
      break;
    case "arts":
      bgImage = "/artsbg.svg";
      break;
    case "quick":
      bgImage = "/quickbg.svg";
      break;
    default:
      bgImage = "/artsbg.svg";
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
              <img
                src={servantFace}
                className="custom-avatar"
                alt="servant icon"
              />
            </div>
            <div className="tag">
              <TagImage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServantAvatar;