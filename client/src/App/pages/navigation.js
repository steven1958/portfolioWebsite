import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {FaAngleDown} from 'react-icons/fa';
import ErrorBoundary from 'src/App/errorBoundary';

export default class Navigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	style:this.props.navigationStyle,
    	pageInfo:[],
      dropdownClass:"",
      menuWrapClass:"",
      width:window.innerWidth
    };
    this.clickToggleButton=this.clickToggleButton.bind(this);
    this.clickOutsideMenu=this.clickOutsideMenu.bind(this);
    this.createSubLinks=this.createSubLinks.bind(this);
    this.stopPropogation=this.stopPropogation.bind(this);
    this.updateDimensions=this.updateDimensions.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
    axios.get('/api/getPageInfo').then((response) => {
      this.setState({pageInfo:response.data});
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  updateDimensions = () => {
    this.setState({ width: window.innerWidth });
  };

  clickToggleButton(){
    if (this.state.dropdownClass===""){
      this.setState({dropdownClass:"buttonOpen"});
      this.setState({menuWrapClass:"dropDownMenuShow"});
    } else {
      this.setState({dropdownClass:""});
      this.setState({menuWrapClass:""});
    }
  }

  clickOutsideMenu(){
    this.setState({dropdownClass:""});
    this.setState({menuWrapClass:""});
  }

  stopPropogation(e){
    e.stopPropagation();
  }

  createSubLinks = (childId) => {
    for(let i=0; i<this.state.pageInfo.length; i++) {
      let page=this.state.pageInfo[i];
      if (page._id===childId && page.title){
        return (<Link key={page._id} className="small-dropdown-link" to={`/${page.title.replace(/\s+/g, '')}`}>{page.title}</Link>);
      }
    }
  }

  render(){
    if (this.state.style==="sidebar" && this.state.width>700){

      const createLinks = [].slice.call(this.state.pageInfo).sort((a,b) => a.index - b.index).map((page) => {
          if (page.visibility && page.children && page.children.length>0){
             return (
                <div key={page.title}>
                  <div className='sideDropDown sideLink dropbtn'>{page.title} <FaAngleDown />
                    <div className='dropdown-content'>
                     { page.children.map((childId)=>
                        this.createSubLinks(childId)
                      )}
                    </div>
                  </div>
                </div>
              )
          } else if (page.parent){
              return null;
          } else if (page.title && page.visibility){
            return <Link key={page._id} to={`/${page.title.replace(/\s+/g, '')}`} className='sideLink'>{page.title}</Link>     
          }
        }
      );

      return(
        <div className="menuSideBar">
          <div>
             <Link key='home' to={'/'} className='sideLink'>Home</Link>      
              { createLinks }
              <div key='contact' className='sideLink' onClick={ this.props.showContact } >Contact</div>
          </div>
        </div>
      );


    } else if (this.state.style==="top" && this.state.width>600){

      const createLinks = [].slice.call(this.state.pageInfo).sort((a,b) => a.index - b.index).map((page) => {
          if (page.visibility && page.children && page.children.length>0){
             return (<li key={page._id} className='navbar-link dropdown-link'>
                  <div className='navbar-link dropbtn'>{page.title} <FaAngleDown /></div>
                  <div className='dropdown-content'>
                   { page.children.map((childId)=>
                      this.createSubLinks(childId)
                    )}
                  </div>
                </li>
              )
          } else if (page.parent){
              return null;
          } else if (page.title && page.visibility){
            return <li key={page._id} className='navbar-link'><Link to={`/${page.title.replace(/\s+/g, '')}`} className='navbar-link'>{page.title}</Link></li>
          }
        }
      );

      return(
          <ErrorBoundary>
            <div className='navbar'>
              <ul className='navbar-links'>
                <li className='navbar-link'><Link to={'/'} className='navbar-link'>Home</Link></li>
                { createLinks }
                <li key='contact' className='navbar-link'><div className='navbar-link' onClick={ this.props.showContact } >Contact</div></li>
              </ul>
            </div>
          </ErrorBoundary >
        );
    } else {
      const createLinks = [].slice.call(this.state.pageInfo).sort((a,b) => a.index - b.index).map((page) => {
          if (page.visibility && page.children && page.children.length>0){
             return (
                <li key={page._id} className="menu-item-has-children">
                  <div className='dropDownMenuLink dropbtn'>{page.title} <FaAngleDown />
                    <div className='dropdown-content'>
                     { page.children.map((childId)=>
                        this.createSubLinks(childId)
                      )}
                    </div>
                  </div>                    
                </li>
              )
          } else if (page.parent){
              return null;
          } else if (page.title && page.visibility){
            return <li key={page._id} ><Link to={`/${page.title.replace(/\s+/g, '')}`} className='dropDownMenuLink'>{page.title}</Link></li>          
          }
        }
      );

    	return(
        <div className={`custom-dropdown-menu ${this.props.menuAlignment}`}>
          <span className={`menuToggleButton ${this.state.dropdownClass} ${this.props.menuAlignment}`} onClick={this.clickToggleButton}>
            <div className="menuBar">Menu<FaAngleDown /></div>
          </span>
          <div className={`dropDownMenuWrap ${this.state.menuWrapClass} ${this.props.menuAlignment}`} onClick={this.clickOutsideMenu}>
            <div>
              <ul className="dropDownMenu">
                <li key='home' ><Link to={'/'} className='dropDownMenuLink'>Home</Link></li>          
                { createLinks }
                <li key='contact'><div className='dropDownMenuLink' onClick={ this.props.showContact } >Contact</div></li>
              </ul>
            </div>
          </div>
        </div>
    	);
    } 
  }


}

