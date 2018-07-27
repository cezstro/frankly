import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Player } from 'video-react';
import "video-react/dist/video-react.css"; // import css
import ReactPlayer from 'react-player';
import $ from "jquery";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
var _ = require('lodash');
const axios = require('axios');

class App extends Component {
  constructor(props) {
    super(props);
    localStorage.removeItem('currentIndex');
    this.state = {
      playListData: [],
      currentVideoUrl : '',
      currentVideoTitle : ''
    }
  }

  componentWillMount() {
    this.loadData();
  }

  loadData() {
    axios.get('https://s3.amazonaws.com/frankly-news-web/test/playlist.js')
      .then((response) => {
        var removeCallback = _.replace(response.data, 'callback(', '');
        var responseDatas = _.replace(removeCallback, ')', '');
        var responseJSON = JSON.parse(responseDatas).playlist;
        this.setState({
          playListData: responseJSON,
          currentVideoUrl : responseJSON[0].content_url,
          currentVideoTitle : responseJSON[0].title
        });

        localStorage.setItem('current', JSON.stringify(responseJSON[0]));
        localStorage.setItem('currentIndex', 0);

        var id = responseJSON[0].platform_id;
        $('#'+id).addClass('highlight-image-border');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  endvideo() {
    var currentIndex = localStorage.getItem('currentIndex');
    var nextVideo = 0;
    
    if(parseInt(currentIndex) == (this.state.playListData.length - 1)) {
      nextVideo = 0;
    } else {
      nextVideo = parseInt(currentIndex) + 1;
    }

    var getNextVideoData = this.state.playListData[parseInt(nextVideo)];
    localStorage.setItem('currentIndex', nextVideo);
    this.setState({
      currentVideoUrl : getNextVideoData.content_url,
      currentVideoTitle : getNextVideoData.title
    });

    $('.highlight-image-border').removeClass('highlight-image-border');
    var id = getNextVideoData.platform_id;
    $('#'+id).addClass('highlight-image-border');
  }

  exiculteVideo(data) {
    this.setState({
      currentVideoUrl : data.content_url,
      currentVideoTitle : data.title
    });

    localStorage.setItem('currentIndex', _.indexOf(this.state.playListData, data));

    $('.highlight-image-border').removeClass('highlight-image-border');
    var id = data.platform_id;
    $('#'+id).addClass('highlight-image-border');
  }

  render() {
    const settings = {
      infinite: true,
      speed: 500,
      slidesToShow: 5,
      slidesToScroll: 5
    };

    var imageStyle = {
      'width' : '80%'
    }

    var sliderImage = this.state.playListData.map((data, index) => {
      return <div className="d-inline" onClick={e => this.exiculteVideo(data)}>
                  <img src={data.image_url} style={imageStyle} id={data.platform_id}/>
                  <label className="text-left visible-sm">{data.title.substring(0, 5) + ' ...'}&nbsp;&nbsp;&nbsp;&nbsp;</label>
            </div>
    });

    return (
      <div>
        <div className="row">
          <div className="col-lg-2 col-md-2"></div>
          <div className="col-lg-8 col-md-8 col-xs-12 col-sm-12 text-center">
            <ReactPlayer url={this.state.currentVideoUrl} playing={true} width="100%" playsinline={true} controls={true} onEnded={() => this.endvideo()}/>
            <label>{this.state.currentVideoTitle}</label>
          </div>
          <div className="col-lg-2 col-md-2"></div>
        </div><br/>
        <div className="row">
          <div className="col-lg-2 col-md-2 col-xs-1 col-sm-1"></div>
          <div className="col-lg-8 col-md-8 col-xs-10 col-sm-10 text-center">
            <Slider {...settings}>
              {sliderImage}
            </Slider>
          </div>
          <div className="col-lg-2 col-md-2 col-xs-1 col-sm-1"></div>
        </div>
      </div>
    );
  }
}

export default App;
