  export const roundTime = (time:string)=>{
    let hours=Number(time.split(':')[0])
    let minutes=Number(time.split(':')[1])
    let m = (Math.round(minutes/15) * 15) % 60;
    const string_m = m < 10 ? '0' + m : m;
    let h = minutes > 52 ? (hours === 23 ? 0 : ++hours) : hours;
    const string_h = h < 10 ? '0' + h : h;
    return string_h + ':' +string_m
  }
