import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getEnv } from "@/lib/cloudflare";
export const runtime = "edge";
export async function GET(request: Request) { if(!await requireAdmin(request))return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Admin login required."}},{status:401}); const url=new URL(request.url); const search=url.searchParams.get("search")||""; const db=getEnv().DB; if(db){const result=await db.prepare("SELECT l.*,c.name,c.phone,c.email,c.city,c.state FROM leads l JOIN customers c ON c.id=l.customer_id WHERE (? = '' OR c.name LIKE ? OR c.phone LIKE ?) ORDER BY l.created_at DESC LIMIT 100").bind(search,`%${search}%`,`%${search}%`).all(); return NextResponse.json({success:true,data:{items:result.results,search}});} return NextResponse.json({success:true,data:{items:[],search,message:"D1 is not bound in this environment."}}); }
