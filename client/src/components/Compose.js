import React from "react";
import "./Post.css";

class Composer extends React.PureComponent{
	constructor(props){
		super(props);
		this.state = {
			content:""
		}
	}

	onChange(e){
		this.setState({content:e.target.value})
	}

	submit(e){
		//TODO actually implement this
		alert(this.state.content);
	}
	

	render(){
		return <div className="Post">
			<div className="Post_info-container">
				<div className="Post_author">Author</div>
				<div className="Post_timestamp">Timestamp</div>
			</div>
			<textarea 
				className="Post_editable" 
				onChange={e => this.onChange(e)}
				value={this.state.content}/>
			<div className="Post_button-container">
				<button className="Post_submit-button" onClick={e => this.submit(e)}>Post</button>
			</div>
		</div>
	}
}

export default Composer;
