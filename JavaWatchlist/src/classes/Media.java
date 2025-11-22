package classes;
public class Media {
	int id;
	String name;
	String genre;
	String desc;
	double duration = 0;
	int desire;
	boolean watched;
	
	//Constructor
	public Media(String name, String genre, String desc, double duration, int desire){
		this.name = name;
		this.genre = genre;
		this.desc = desc;
		this.duration = duration;
		this.desire = desire;
		this.watched = false;		
	}
	
	//Getters
	
	public int getID(){
		return id;
	}
	
	public String getName(){
		return name;
	}
	
	public String getGenre(){
		return genre;
	}
	
	public String getDesc(){
		return desc;
	}
	
	public double getDuration(){
		return duration;
	}
	
	public int getDesire(){
		return desire;
	}
	
	public boolean getWatched(){
		return watched;
	}
	
    @Override
    public String toString() {
    	
        return "#" + id + ", Title= " + name + ", Description= " + desc + ", Genre=" + genre + ", Duration= " + duration + ", Desire= " + desire + ", Watched= " + watched;
    }
	
	//Setters
	
	public void setID(int id){
		this.id = id;
	}
	
	public void setName(String name){
		this.name = name;
	}
	
	public void setGenre(String genre){
		this.genre = genre;
	}
	
	public void setDesc(String desc){
		this.desc = desc;
	}
	
	public void setDuration(double duration){
		this.duration = duration;
	}
	
	public void setDesire(int desire){
		this.desire = desire;
	}
	
	public void setWatched(boolean watched){
		this.watched = watched;
	}
	
	//Other functions
	
	
	
	
	

}
