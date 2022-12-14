import nodemailer from "nodemailer";
import mg from "nodemailer-mailgun-transport";
import handlebars from "handlebars";
import fs from "fs";
import { mailSenderConfig } from "../utils/index";

import dotenv from "dotenv"
dotenv.config();
const emailTemplate = fs.readFileSync(
  `${process.cwd()}/src/templates/newsletter.hbs`,
  "utf-8"
);

interface ImailgunAuth {
    auth: {
      api_key: string | undefined;
      domain: string | undefined;
    };
  }
  const mailgunAuth = {
    auth: {
      api_key: process.env.MAILGUN_API_KEY as string,
      domain: process.env.MAILGUN_DOMAIN as string,
    },
  } as ImailgunAuth;


  const template = handlebars.compile(emailTemplate)


async function wrappedSendMail(options: any) {
    return new Promise((res, rej) => {
      // @ts-ignore
      let transport = nodemailer.createTransport(mg(mailgunAuth));
      transport.sendMail(options, function (error, response) {
        if (error) return rej(error);
  
        return res(response);
      });
    });
  }

  export const newLetterEmail = async (
    to: string,
    name:string
  ) => {
    const { from, emailSubject, replyTo } = mailSenderConfig;
    const sendApplicationResp = template({
      name,
      replyTo,
    });
    
    const newsLetterMailOptions = {
      from,
      to,
      subject: emailSubject,
      html: sendApplicationResp,
    };
  
    try {
      const response = await wrappedSendMail(newsLetterMailOptions);
      return {
        status: true,
        to,
        message: "Successfully sent email",
        data: response,
      };
    } catch (e) {
      return {
        status: false,
        error: e,
      };
    }
  };