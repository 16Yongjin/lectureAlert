const request = require('request');
const client = require('cheerio-httpcli');
const moment = require('moment');

const mm = [
    'AAR01_H1',
    'A1CE1_H1',
    'AAQ01_H1',
    'AKAA1_H1',
    'AKA_H1',
    'A2AA1_H1',
    'A2A_H1',
    'ALA_H1',
    'ALAA1_H1',
    'AEC_H1',
    'AECA1_H1',
    'ACDD1_H1',
    'AFF01_H1',
    'ACAI1_H1',
    'AEAA1_H1',
    'AGA_H1',
    'AGAA1_H1',
    'AAH01_H1',
    'AAD01_H1',
    'AAC01_H1',
    'AFC01_H1',
    'ABP01_H1',
    'ANJA1_H1',
    'ABC01_H1',
    'ABJ01_H1',
    'ANDD2_H1',
    'ACD_H1',
    'ACDE1_H1',
    'ADA01_H1',
    'ABF01_H1',
    'AAP01_H1',
    'ANDB2_H1',
    'AKAB1_H1',
    'AANA1_H1',
    'AAI01_H1',
    'AAE01_H1',
    'ABD01_H1',
    'ACDA1_H1',
    'A1CF1_H1',
    'ANDC2_H1',
    'A1CD1_H1',
    'AFA01_H1',
    'A1BD1_H1',
    'A1CA1_H1',
    'AFH01_H1',
    'ATMB2_H1',
    'AJDA1_H1',
    'AJD_H1',
    'ABI01_H1',
    'AAF01_H1',
    'ABG01_H1',
    'AJCA1_H1',
    'AJC_H1',
    'ACBA1_H1',
    'AFI01_H1',
    'AICA1_H1',
    'AIC_H1',
    'AIDA1_H1',
    'AID_H1',
    'ANDA2_H1',
    'ABE01_H1',
    'ABH11_H1',
    'AAK01_H1',
    'AAB01_H1',
    'AFB01_H1',
    'AAM_H1',
    'AFD01_H1',
    'ACBB1_H1',
    '301_H1',
    '302_H1',
    '304_H1',
    '320_H1',
    '327_H1',
    '328_H1',
    '32A_H1',
    '32V_H1',
    '32Z_H1',
    '330_H1',
    '331_H1',
    '332_H1',
    '333_H1',
    '334_H1',
    '335_H1',
    '61_H1'
];

let myLecture = ['AAK01_H1', 'A1CF1_H1', '301_H1', '302_H1'];

let myClass = [
    'J11024101',
    'J11025101',
    'Y12102330',
    'Y12102331',
    'Y12102332',
    'Y13102239'
];

let sentLecture = {};

const lectureCheck = (majors, callback) => {

    let lectureInfos = [];

    let completed_requests = 0;

    majors.forEach(major => {
        let url = `http://wis.hufs.ac.kr:8989/src08/jsp/lecture/LECTURE2020L.jsp?tab_lang=K&type=&ag_ledg_year=2017&ag_ledg_sessn=3&ag_org_sect=A&campus_sect=H1`;

        url +=
            major[0] === 'A'
                ? `&ag_crs_strct_cd=${major}&gubun=1`
                : `&ag_compt_fld_cd=${major}&gubun=2`;

        client.fetch(url, {}, function(err, $, res) {
            if (err) {
                console.log('Error : ', err);
                return;
            }

            let fetchHtml = $('div')
                .children('div')
                .children('table')
                .children('tbody')
                .html();
            fetchHtml = fetchHtml.match(/<tr>(.|[\r\n])+?<\/tr>/g);
            fetchHtml = fetchHtml.map(i =>
                i.replace(/\s{2,}/g, '\n').replace(/(<([^>]+)>)/gi, '')
            );

            fetchHtml.splice(0, 1);

            let lecture = [];

            fetchHtml.forEach(i => {
                
                let s = i.split('\n');
                s = s.filter(i => i !== '');
                // console.log(s);
                let obj = {};
                obj.num = s[0];
                obj.area = s[1];
                obj.year = s[2];
                obj.course_number = s[3];
                obj.subject = s[4];

                if (obj.subject.startsWith('(')) {
                    obj.year = 0
                    obj.course_number = s[2];
                    obj.subject = s[3];
                }

                obj.professor = s[6];
                if (s[6][0] === '(' || s[6].length <= 1) {
                    obj.professor = s[5];
                }

                obj.note = s[s.length - 1].includes(' / ') ? '' : s[s.length - 1]; // 비고사항

                const timeIndex = obj.note === '' ? 2 : 3

                obj.time = s[s.length - timeIndex];
                if (obj.time.includes(')')) {
                    obj.time =  obj.time.slice(0, obj.time.indexOf(')') + 1);
                }

                obj.people = s.filter(k => k.includes(' / '))[0]

                if (obj.people) {
                    obj.isEmpty =
                        Number(obj.people.replace(/(\d+).\/.(\d+)/g, '$1')) /
                            Number(
                                obj.people.replace(/(\d+).\/.(\d+)/g, '$2')
                            ) <
                        1;
                }

                
                lecture.push(obj);
                obj = {};
            });

            lectureInfos = lectureInfos.concat(lecture);

            completed_requests++;


            if (completed_requests === majors.length) {
                callback(lectureInfos);
            }
        });
    });
};


const cachedLectureCheck = (majors, course_numbers, callback) => {
    let lectureInfos = [];

    let completed_requests = 0;

    majors.forEach(major => {
        let url = `http://wis.hufs.ac.kr:8989/src08/jsp/lecture/LECTURE2020L.jsp?tab_lang=K&type=&ag_ledg_year=2017&ag_ledg_sessn=3&ag_org_sect=A&campus_sect=H1`;

        url +=
            major[0] === 'A'
                ? `&ag_crs_strct_cd=${major}&gubun=1`
                : `&ag_compt_fld_cd=${major}&gubun=2`;

        client.fetch(url, {}, function(err, $, res) {
            if (err) {
                console.log('Error : ', err);
                return;
            }

            let fetchHtml = $('div')
                .children('div')
                .children('table')
                .children('tbody')
                .html();
            fetchHtml = fetchHtml.match(/<tr>(.|[\r\n])+?<\/tr>/g);
            fetchHtml = fetchHtml.map(i =>
                i.replace(/\s{2,}/g, '\n').replace(/(<([^>]+)>)/gi, '')
            );

            fetchHtml.splice(0, 1);

            let lecture = [];

            fetchHtml.forEach(i => {

                let s = i.split('\n');
                s = s.filter(i => i !== '');
                if (course_numbers.includes(s[3]) || course_numbers.includes(s[2]) ) {

                
                //console.log(s);
                let obj = {};
                obj.num = s[0];
                obj.area = s[1];
                obj.year = s[2];
                obj.course_number = s[3];
                obj.subject = s[4];
                obj.professor = s[6];

                if (obj.subject.startsWith('(')) {
                    obj.year = 0
                    obj.course_number = s[2];
                    obj.subject = s[3];
                }

                if (s[6][0] === '(' || s[6].length <= 1) {
                    obj.professor = s[5];
                }

                obj.note = s[s.length - 1].includes(' / ') ? '' : s[s.length - 1]; // 비고사항

                const timeIndex = obj.note === '' ? 2 : 3

                obj.time = s[s.length - timeIndex];
                
                if (obj.time.includes(')')) {
                    obj.time =  obj.time.slice(0, obj.time.indexOf(')') + 1);
                }

                obj.people = s.filter(k => k.includes(' / '))[0]

                if (obj.people) {
                    obj.isEmpty =
                        Number(obj.people.replace(/(\d+).\/.(\d+)/g, '$1')) /
                            Number(
                                obj.people.replace(/(\d+).\/.(\d+)/g, '$2')
                            ) <
                        1;
                }

                
                lecture.push(obj);
                obj = {};
                }
            });

            lectureInfos = lectureInfos.concat(lecture);

            completed_requests++;


            if (completed_requests === majors.length) {
                callback(lectureInfos);
            }
        });
    });
};


const sendMessageToMe = (title, text) => {
    let url = 'https://fcm.googleapis.com/fcm/send';

    // Set the headers
    const headers = {
        Authorization:
            'key=AAAAF0fPUwk:APA91bGP8nfVgRPNlDMAlWp49b2OyJch2sVfIWYGdbTQ0QFDVmoOpzLuXRvAT9DuhMGxFcmgmcu2qQQEUUNSCpwWWV8GV_AsDTD8iABjWSz1kZ1mJRsS9iwODl7TR3j1ddIejTaQ8D_v',
        'Content-Type': 'application/json'
    };

    const body = {
        notification: {
            title,
            text,
            sound: 'noti',
            color: '#2C5398',
            icon: 'firebase-logo'
        },
        to:
            'dsotDofsOPM:APA91bG5HVPNKObqeyRbTMwbJ-OgOobxPyCsEGoFWGtl1slL5cw67t1z9DopWHlQsau4wVPhPPMkKK5Eo9YD26pY5szAqubk31M0nTXjrLdm3oW0-XIKW9-gbsnjWL_u8lBmZCoV_NRW'
    };

    // Configure the request
    const options = {
        url: url,
        method: 'POST',
        headers,
        json: body
    };

    // Start the request
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            return;
        }
    });
};


const sendMessage = (token, title, text) => {
    let url = 'https://fcm.googleapis.com/fcm/send';

    // Set the headers
    const headers = {
        Authorization:
            'key=AAAAF0fPUwk:APA91bGP8nfVgRPNlDMAlWp49b2OyJch2sVfIWYGdbTQ0QFDVmoOpzLuXRvAT9DuhMGxFcmgmcu2qQQEUUNSCpwWWV8GV_AsDTD8iABjWSz1kZ1mJRsS9iwODl7TR3j1ddIejTaQ8D_v',
        'Content-Type': 'application/json'
    };

    const body = {
        notification: {
            title,
            text,
            sound: 'notiSound.mp3',
            color: '#2C5398',
            icon: 'firebase-logo.png',
            "click_action" : "http://hufs.ac.kr/"            
        },
        to: token
    };

    // Configure the request
    const options = {
        url: url,
        method: 'POST',
        headers,
        json: body
    };

    // Start the request
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            return;
        }
    });
};


const getLectureAndSendNotitoMe = () => {
    lectureCheck(myLecture, i => {
        let res = i.filter(j => myClass.includes(j.course_number));
        // console.log(res);
        res.map(j => {
            if (!sentLecture[j.course_number] && j.isEmpty) {
                sendMessageToMe(`${j.subject}`, `${j.professor} 교수님, 빈 자리 생겼어요`);
                sentLecture[j.course_number] = true;
            }

            if (sentLecture[j.course_number] && !j.isEmpty) {
                sentLecture[j.course_number] = false;
                sendMessageToMe(`${j.subject}`, `${j.professor} 교수님, 꽉 찼네요`);
            }
        });
    });
};


const getCachedLectureAndSendNoti = (majors, lectures, tokens, users) => {

    const hour = moment().format('h');

    // if (!(10 <= hour && hour <= 16)){
    //     return;
    // }
    
    // console.log('majors :', majors, 'lectures:', lectures, 'tokens:', tokens, 'users:', users);
    cachedLectureCheck(majors.cache, lectures.cache, res => {
        res.map(i => {
            // console.log('found lecture: ', i);

            const course_number = i.course_number;

                lectures.tokens[course_number].map(token => {
                    let l = users[token].lecture_infos.find(lectureInfo => lectureInfo.course_number === course_number );

                    if (!l) {
                        return;
                    }
                    l.people = i.people;                        

                    if (i.isEmpty &&  !users[token].sentLecture[course_number]) {
                        console.log(i.subject, i.people, moment().format('hh:mm:ss'));
                        users[token].sentLecture[course_number] = true;
                        sendMessage(token, `${i.subject}`, `${i.professor} 교수님, 빈 자리 생겼어요` );                            
                    }

                    if (!i.isEmpty && users[token].sentLecture[course_number]) {
                        console.log(i.subject, i.people, moment().format('hh:mm:ss'));
                        users[token].sentLecture[course_number] = false;
                        sendMessage(token, `${i.subject}`, `${i.professor} 교수님, 자리 다 찼네요` );   
                    }
                })

            });
    }); 
}


module.exports = {lectureCheck, getCachedLectureAndSendNoti, sendMessage}


// lectureCheck(myLecture, i => {
//     console.log(i);
// })




// if (10 <= o && 0 <= 16) {

//         setInterval(getLectureAndSendNoti, 3000);
    
// } else {
//     setInterval(() => {

//         if (10 <= o && 0 <= 16)
//             return 
//     }, 10000)
// }



