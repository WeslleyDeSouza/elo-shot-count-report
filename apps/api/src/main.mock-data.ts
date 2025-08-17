import { TestMockUserMock  } from '@movit/auth-api';
import { TestMockTenantMock } from '@app-galaxy/core-api';
import { DataSource } from 'typeorm';

export enum API_APPS_MAPPING {
  TEMPLATE_BUILDER_EMAIL = 12,
  BOOKMARKS_OVERVIEW = 16,
  DOCUMENTATION_OVERVIEW = 19,
  ADMIN_REPORT_ENTRIES = 20,
  ADMIN_REPORT_EXPORT = 21,

  ADMIN_DATA_LIST_AREAL = 22,
  ADMIN_DATA_LIST_WEAPON = 23,
  ADMIN_DATA_LIST_RELATION = 24,
  ADMIN_COORDINATION_OFFICE = 25,
}


export namespace API_MOCK_DATA {

  export const customApps = [
    // Category 2: menu.settings (Template builders)
    {
      appId: API_APPS_MAPPING.TEMPLATE_BUILDER_EMAIL,
      domain: 'business',
      tenantId: null,
      title: 'Email Templates',
      path: '/template-builder/email',
      categoryId: 2,
      img: null,
      icon: 'ri-mail-line',
    },

    // Category X: others
    {
      appId: API_APPS_MAPPING.BOOKMARKS_OVERVIEW,
      domain: 'business',
      tenantId: null,
      title: 'Bookmarks overview',
      path: '/bookmarks/overview',
      categoryId: 6,
      img: null,
      icon: 'ri-bookmark-line',
    },
    {
      appId: API_APPS_MAPPING.DOCUMENTATION_OVERVIEW,
      domain: 'business',
      tenantId: null,
      title: 'Documentation overview',
      path: '/documentations',
      categoryId: 5,
      img: null,
      icon: 'ri-book-line',
    },

    // Category X: Main Apps
    {
      appId: API_APPS_MAPPING.ADMIN_REPORT_ENTRIES,
      domain: 'business',
      tenantId: null,
      title: 'menu.records',
      path: '/admin/report/entries',
      categoryId: 7,
      img: null,
      icon: 'ri-file-list-line',
    },
    {
      appId: API_APPS_MAPPING.ADMIN_REPORT_EXPORT,
      domain: 'business',
      tenantId: null,
      title: 'menu.export',
      path: '/admin/report/export',
      categoryId: 7,
      img: null,
      icon: 'ri-download-line',
    },
    {
      appId: API_APPS_MAPPING.ADMIN_DATA_LIST_AREAL,
      domain: 'business',
      tenantId: null,
      title: 'menu.area',
      path: '/admin/areal/overview',
      categoryId: 8,
      img: null,
      icon: 'ri-map-line',
    },
    {
      appId: API_APPS_MAPPING.ADMIN_DATA_LIST_WEAPON,
      domain: 'business',
      tenantId: null,
      title: 'menu.weapon_list',
      path: '/admin/weapon/overview',
      categoryId: 8,
      img: null,
      icon: 'ri-sword-line',
    },
    {
      appId: API_APPS_MAPPING.ADMIN_DATA_LIST_RELATION,
      domain: 'business',
      tenantId: null,
      title: 'menu.relation',
      path: '/admin/data-list-relation',
      categoryId: 8,
      img: null,
      icon: 'ri-links-line',
    },
    {
      appId: API_APPS_MAPPING.ADMIN_COORDINATION_OFFICE,
      domain: 'business',
      tenantId: null,
      title: 'menu.co',
      path: '/admin/coordination-office/overview',
      categoryId: 8,
      img: null,
      icon: 'ri-building-line',
    },
  ];

  export const customCategories = [
    {
      categoryId: 5,
      domain: 'business',
      title: 'menu.documentations',
      parentCategoryId: null,
      img: 'assets/icons/menu/documentation.svg',
      icon: 'ri-book-line',
    },
    {
      categoryId: 6,
      domain: 'business',
      title: 'menu.others',
      parentCategoryId: null,
      img: 'assets/icons/menu/others.svg',
      icon: 'ri-more-line',
    },
    {
      categoryId: 7,
      domain: 'business',
      title: 'menu.sr',
      parentCategoryId: null,
      img: 'assets/icons/menu/sr.svg',
      icon: 'ri-bar-chart-line',
    },
    {
      categoryId: 8,
      domain: 'business',
      title: 'menu.data_management',
      parentCategoryId: null,
      img: 'assets/icons/menu/data-management.svg',
      icon: 'ri-database-line',
    },
  ];

  export const initMockData = async (connection: DataSource)=> {
      await TestMockTenantMock.fill.All(connection).catch(() => null);
      await TestMockUserMock.fill.User(connection).catch(() => null);
      await TestMockUserMock.fill.User(connection).catch(() => null);
      await TestMockUserMock.fill.Apps(connection,customApps,customCategories).catch(() => null);
      await TestMockUserMock.fill.RoleApps(connection).catch(() => null);
      await TestMockUserMock.fill.AuthTemplate(connection, {
        id:1,
        template:`<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Passwort zurücksetzten</title>
    <link href=''https://fonts.googleapis.com/css?family=Asap:400,400italic,700,700italic'' rel=''stylesheet'' type=''text/css''>
    <style type="text/css">
        .social-icons-list{
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
        }
        .social-icons-list a {
            color: #fff;
        }
        .social-icons-list img {
            max-width: 25px;
        }
        .social-icons-list-item{
            margin: 10px;
            margin-top: 0;
            margin-bottom: 0;
            min-width: 25px;
        }
        @media only screen and (min-width:768px){
            .templateContainer{
                width:600px !important;
            }

        }   @media only screen and (max-width: 480px){
            body,table,td,p,a,li,blockquote{
                -webkit-text-size-adjust:none !important;
            }

        }   @media only screen and (max-width: 480px){
            body{
                width:100% !important;
                min-width:100% !important;
            }

        }   @media only screen and (max-width: 480px){
            #bodyCell{
                padding-top:10px !important;
            }

        }   @media only screen and (max-width: 480px){
            .mcnImage{
                width:100% !important;
            }

        }   @media only screen and (max-width: 480px){

            .mcnCaptionTopContent,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer{
                max-width:100% !important;
                width:100% !important;
            }

        }   @media only screen and (max-width: 480px){
            .mcnBoxedTextContentContainer{
                min-width:100% !important;
            }

        }   @media only screen and (max-width: 480px){
            .mcnImageGroupContent{
                padding:9px !important;
            }

        }   @media only screen and (max-width: 480px){
            .mcnCaptionLeftContentOuter
            .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{
                padding-top:9px !important;
            }

        }   @media only screen and (max-width: 480px){
            .mcnImageCardTopImageContent,.mcnCaptionBlockInner
            .mcnCaptionTopContent:last-child .mcnTextContent{
                padding-top:18px !important;
            }

        }   @media only screen and (max-width: 480px){
            .mcnImageCardBottomImageContent{
                padding-bottom:9px !important;
            }

        }   @media only screen and (max-width: 480px){
            .mcnImageGroupBlockInner{
                padding-top:0 !important;
                padding-bottom:0 !important;
            }

        }   @media only screen and (max-width: 480px){
            .mcnImageGroupBlockOuter{
                padding-top:9px !important;
                padding-bottom:9px !important;
            }

        }   @media only screen and (max-width: 480px){
            .mcnTextContent,.mcnBoxedTextContentColumn{
                padding-right:18px !important;
                padding-left:18px !important;
            }

        }   @media only screen and (max-width: 480px){
            .mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{
                padding-right:18px !important;
                padding-bottom:0 !important;
                padding-left:18px !important;
            }

        }   @media only screen and (max-width: 480px){
            .mcpreview-image-uploader{
                display:none !important;
                width:100% !important;
            }

        }   @media only screen and (max-width: 480px){
            /*
            @tab Mobile Styles
            @section Heading 1
            @tip Make the first-level headings larger in size for better readability
         on small screens.
            */
            h1{
                /*@editable*/font-size:20px !important;
                /*@editable*/line-height:150% !important;
            }

        }   @media only screen and (max-width: 480px){
            /*
            @tab Mobile Styles
            @section Heading 2
            @tip Make the second-level headings larger in size for better
         readability on small screens.
            */
            h2{
                /*@editable*/font-size:20px !important;
                /*@editable*/line-height:150% !important;
            }

        }   @media only screen and (max-width: 480px){
            /*
            @tab Mobile Styles
            @section Heading 3
            @tip Make the third-level headings larger in size for better readability
         on small screens.
            */
            h3{
                /*@editable*/font-size:18px !important;
                /*@editable*/line-height:150% !important;
            }

        }   @media only screen and (max-width: 480px){
            /*
            @tab Mobile Styles
            @section Heading 4
            @tip Make the fourth-level headings larger in size for better
         readability on small screens.
            */
            h4{
                /*@editable*/font-size:16px !important;
                /*@editable*/line-height:150% !important;
            }

        }   @media only screen and (max-width: 480px){
            /*
            @tab Mobile Styles
            @section Boxed Text
            @tip Make the boxed text larger in size for better readability on small
         screens. We recommend a font size of at least 16px.
            */
            .mcnBoxedTextContentContainer
            .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{
                /*@editable*/font-size:16px !important;
                /*@editable*/line-height:150% !important;
            }

        }   @media only screen and (max-width: 480px){
            /*
            @tab Mobile Styles
            @section Preheader Visibility
            @tip Set the visibility of the email''s preheader on small screens. You
         can hide it to save space.
            */
            #templatePreheader{
                /*@editable*/display:block !important;
            }

        }   @media only screen and (max-width: 480px){
            /*
            @tab Mobile Styles
            @section Preheader Text
            @tip Make the preheader text larger in size for better readability on
         small screens.
            */
            #templatePreheader .mcnTextContent,#templatePreheader
            .mcnTextContent p{
                /*@editable*/font-size:12px !important;
                /*@editable*/line-height:150% !important;
            }

        }   @media only screen and (max-width: 480px){
            /*
            @tab Mobile Styles
            @section Header Text
            @tip Make the header text larger in size for better readability on small
         screens.
            */
            #templateHeader .mcnTextContent,#templateHeader .mcnTextContent p{
                /*@editable*/font-size:16px !important;
                /*@editable*/line-height:150% !important;
            }

        }   @media only screen and (max-width: 480px){
            /*
            @tab Mobile Styles
            @section Body Text
            @tip Make the body text larger in size for better readability on small
         screens. We recommend a font size of at least 16px.
            */
            #templateBody .mcnTextContent,#templateBody .mcnTextContent p{
                /*@editable*/font-size:16px !important;
                /*@editable*/line-height:150% !important;
            }

        }   @media only screen and (max-width: 480px){
            /*
            @tab Mobile Styles
            @section Footer Text
            @tip Make the footer content text larger in size for better readability
         on small screens.
            */
            #templateFooter .mcnTextContent,#templateFooter .mcnTextContent p{
                /*@editable*/font-size:12px !important;
                /*@editable*/line-height:150% !important;
            }

        }
    </style>
</head>
<body style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #dfdbd5; height: 100%; margin: 0; padding: 0; width: 100%">
<center>
    <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" id="bodyTable" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #dfdbd5; height: 100%; margin: 0; padding: 0; width: 100%" width="100%">
        <tr>
            <td align="center" id="bodyCell" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; border-top: 0; height: 100%; margin: 0; padding: 0; width: 100%" valign="top">
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                    <tr>
                        <td align="center" valign="top" width="600" style="width:600px;">
                            <table border="0" cellpadding="0" cellspacing="0" class="templateContainer" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; max-width: 600px; border: 0" width="100%">
                                <tr>
                                    <td id="templatePreheader" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #dfdbd5; border-top: 0; border-bottom: 0; padding-top: 16px; padding-bottom: 8px" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" class="mcnTextBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                            <tbody class="mcnTextBlockOuter">
                                            <tr>
                                                <td class="mcnTextBlockInner" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%" valign="top">
                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnTextContentContainer" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                                        <tbody>
                                                        <tr>
                                                            <td class="mcnTextContent" style=''mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; word-break: break-word; color: #2a2a2a; font-family: "Asap", Helvetica, sans-serif; font-size: 12px; line-height: 150%; text-align: center; padding-top:9px; padding-right: 18px; padding-bottom: 9px; padding-left: 18px;'' valign="top">
                                                                <a href="[WEBSITE]" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; color: #2a2a2a; font-weight: normal; text-decoration: none" target="_blank" title="Logo"><img align="none" alt="Logo" src="[LOGO]" style="-ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; height: auto; height: 40px; margin: 0px;" height="40"></a>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td id="templateHeader" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f7f7ff; border-top: 0; border-bottom: 0; padding-top: 16px; padding-bottom: 0" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" class="mcnImageBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                            <tbody class="mcnImageBlockOuter">
                                            <tr>
                                                <td class="mcnImageBlockInner" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding:0px" valign="top">
                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                                        <tbody>
                                                        <tr>
                                                            <td class="mcnImageContent" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-right: 0px; padding-left: 0px; padding-top: 0; padding-bottom: 0; text-align:center;" valign="top">
                                                                <a class="" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; color: #fe5147; font-weight: normal; text-decoration: none" target="_blank" title=""></a> <a class="" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; color: #fe5147; font-weight: normal; text-decoration: none" target="_blank" title=""><img align="center" alt="Passwort vergessen?" class="mcnImage" src="https://i.ibb.co/8BYKzfF/fgp.png" style="-ms-interpolation-mode: bicubic; border: 0; height: auto; outline: none; text-decoration: none; vertical-align: bottom; max-width:1200px; padding-bottom: 0; display: inline !important; vertical-align: bottom;" width="600"></a>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td id="templateBody" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f7f7ff; border-top: 0; border-bottom: 0; padding-top: 0; padding-bottom: 0" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" class="mcnTextBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                            <tbody class="mcnTextBlockOuter">
                                            <tr>
                                                <td class="mcnTextBlockInner" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%" valign="top">
                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnTextContentContainer" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                                        <tbody>
                                                        <tr>
                                                            <td class="mcnTextContent" style=''mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; word-break: break-word; color: #2a2a2a; font-family: "Asap", Helvetica, sans-serif; font-size: 16px; line-height: 150%; text-align: center; padding-top:9px; padding-right: 18px; padding-bottom: 9px; padding-left: 18px;'' valign="top">
                                                                <h1 class="null" style=''color: #2a2a2a; font-family: "Asap", Helvetica, sans-serif; font-size: 32px; font-style: normal; font-weight: bold; line-height: 125%; letter-spacing: 2px; text-align: center; display: block; margin: 0; padding: 0''><span style="text-transform:uppercase">Passwort</span></h1>
                                                                <h2 class="null" style=''color: #2a2a2a; font-family: "Asap", Helvetica, sans-serif; font-size: 24px; font-style: normal; font-weight: bold; line-height: 125%; letter-spacing: 1px; text-align: center; display: block; margin: 0; padding: 0''><span style="text-transform:uppercase">vergessen?</span></h2>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <table border="0" cellpadding="0" cellspacing="0" class="mcnTextBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                            <tbody class="mcnTextBlockOuter">
                                            <tr>
                                                <td class="mcnTextBlockInner" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%" valign="top">
                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnTextContentContainer" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                                        <tbody>
                                                        <tr>
                                                            <td class="mcnTextContent" style=''mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; word-break: break-word; color: #2a2a2a; font-family: "Asap", Helvetica, sans-serif; font-size: 16px; line-height: 150%; text-align: center; padding-top:9px; padding-right: 18px; padding-bottom: 9px; padding-left: 18px;'' valign="top">Keine Sorge, wir helfen Dir weiter!<br>
                                                                Erstelle Dir jetzt Dein neues wunsch Passwort.<br></td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <table border="0" cellpadding="0" cellspacing="0" class="mcnButtonBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                            <tbody class="mcnButtonBlockOuter">
                                            <tr>
                                                <td align="center" class="mcnButtonBlockInner" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top:18px; padding-right:18px; padding-bottom:18px; padding-left:18px;" valign="top">
                                                    <table border="0" cellpadding="0" cellspacing="0" class="mcnButtonBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                                        <tbody class="mcnButtonBlockOuter">
                                                        <tr>
                                                            <td align="center" class="mcnButtonBlockInner" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top:0; padding-right:18px; padding-bottom:18px; padding-left:18px;" valign="top">
                                                                <table border="0" cellpadding="0" cellspacing="0" class="mcnButtonContentContainer" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; border-collapse: separate !important;border-radius: 48px;background-color: #fe5147;">
                                                                    <tbody>
                                                                    <tr>
                                                                        <td align="center" class="mcnButtonContent" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; font-family: ''Asap'', Helvetica, sans-serif; font-size: 16px; padding-top:24px; padding-right:48px; padding-bottom:24px; padding-left:48px;" valign="middle">
                                                                            <a class="mcnButton" href="[LINK]" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; display: block; color: #fe5147; font-weight: normal; text-decoration: none; font-weight: normal;letter-spacing: 1px;line-height: 100%;text-align: center;text-decoration: none;color: #FFFFFF; text-transform:uppercase;" target="_blank" title="Link invitation">Jetzt zurücksetzen</a>
                                                                        </td>
                                                                    </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table><small style="color:#000000;opacity: 0.4;font-family: ''Asap'', Helvetica, sans-serif;margin-top: 5px"><a>Hinweis:</a> Du solltest Dein Passwort niemals jemandem mitteilen</small>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <table border="0" cellpadding="0" cellspacing="0" class="mcnImageBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                            <tbody class="mcnImageBlockOuter">
                                            <tr>
                                                <td class="mcnImageBlockInner" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding:0px" valign="top">
                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                                        <tbody>
                                                        <tr>
                                                            <td class="mcnImageContent" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-right: 0px; padding-left: 0px; padding-top: 0; padding-bottom: 0; text-align:center;" valign="top"></td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td id="templateFooter" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #dfdbd5; border-top: 0; border-bottom: 0; padding-top: 8px; padding-bottom: 80px" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" class="mcnTextBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                            <tbody class="mcnTextBlockOuter">
                                            <tr>
                                                <td class="mcnTextBlockInner" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%" valign="top">
                                                    <table align="center" bgcolor="#F7F7FF" border="0" cellpadding="32" cellspacing="0" class="card" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background:#F7F7FF; margin:auto; text-align:left; max-width:600px; font-family: ''Asap'', Helvetica, sans-serif;" text-align="left" width="100%">
                                                        <tr>
                                                            <td style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%">
                                                                <h3 style=''color: #2a2a2a; font-family: "Asap", Helvetica, sans-serif; font-size: 20px; font-style: normal; font-weight: normal; line-height: 125%; letter-spacing: normal; text-align: center; display: block; margin: 0; padding: 0; text-align: left; width: 100%; font-size: 16px; font-weight: bold;''>Fragen?<br>
                                                                    Ruf uns einfach an.</h3>
                                                                <p style=''margin: 10px 0; padding: 0; mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; color: #2a2a2a; font-family: "Asap", Helvetica, sans-serif; font-size: 12px; line-height: 150%; text-align: left; text-align: left; font-size: 14px;''>Wir laden Dich ein zu einem unverbindlichen Gespräch. Frage unsere Experten nach Rat. Bei uns findest Du einfach passende Online-Lösungen für mehr Erfolg.<br>
                                                                    Und womöglich einen langjährigen, zuverlässigen Partner. Wir würden uns freuen!</p>
                                                                <div style="padding-bottom: 18px;">
                                                                    <a style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; color: #fe5147; font-weight: normal; text-decoration: none; font-size: 14px; color:#fe5147; text-decoration:none;" target="_blank" title="Kontakt">Mehr ❯</a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                                                        <tbody>
                                                        <tr>
                                                            <td style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 24px; padding-right: 18px; padding-bottom: 24px; padding-left: 18px; color: #7F6925; font-family: ''Asap'', Helvetica, sans-serif; font-size: 12px;" valign="top">
                                                                <div style="text-align: center;">
                                                                    Made with <a href="[DOMAIN]" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; color: #fe5147; font-weight: normal; text-decoration: none" target="_blank"><img style="width: 10px; padding-left: 2px; padding-right: 2px; position: relative; top: 1px;" src="https://i.ibb.co/Qbt9tLq/svg-heart.png" alt="svg-heart"></a>by <a href="[DOMAIN]" style="mso-line-height-rule: exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; color: #fe5147; font-weight: normal; text-decoration: none; color:#7F6925;" target="_blank" title="">[COMPANY]</a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                    <table align="center" border="0" cellpadding="12" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
                                                        <tbody>
                                                        <tr class="w-100" style="width: 100%">
                                                            <td colspan="100%" style="width: 100%">
                                                                <section class="widget social_icons-3 social-icons">
                                                                    <ul class="social-icons-list">
                                                                        <li class="social-icons-list-item">
                                                                            <a class="social-icons-list-link icon-facebook" href="https://www.facebook.com/" target="_blank" rel="noreferrer noopener" title="Facebook" aria-label="Facebook (opens in a new tab)"><img src="https://i.ibb.co/6XFdg0r/fb.png" alt="fb"></a>
                                                                        </li>
                                                                        <li class="social-icons-list-item">
                                                                            <a class="social-icons-list-link icon-instagram" href="https://www.instagram.com/" target="_blank" rel="noreferrer noopener" title="Instagram" aria-label="Instagram (opens in a new tab)"><img src="https://i.ibb.co/vQgVKBq/instagram.png" alt="instagram"></a>
                                                                        </li>
                                                                        <li class="social-icons-list-item">
                                                                            <a class="social-icons-list-link icon-linkedin" href="https://ch.linkedin.com/company/" target="_blank" rel="noreferrer noopener" title="LinkedIn" aria-label="LinkedIn (opens in a new tab)"><img src="https://i.ibb.co/sHKLgYy/linkedin.png" alt="linkedin"></a>
                                                                        </li>
                                                                        <li class="social-icons-list-item">
                                                                            <a class="social-icons-list-link icon-whatsapp-url" href="https://wa.me/message/" target="_blank" rel="noreferrer noopener" title="WhatsApp (URL)" aria-label="WhatsApp (URL) (opens in a new tab)"><img src="https://i.ibb.co/93nFK2d/whatsapp.png" alt="whatsapp"></a>
                                                                        </li>
                                                                    </ul>
                                                                </section>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</center>
</body>
</html>`,
        title:'Password Zurücksetzten',
        lang:'de',
        name:"pw:reset"
      }).catch(() => null);
      await TestMockTenantMock.fill.RoleUserCom(connection).catch(() => null);
    }

}

