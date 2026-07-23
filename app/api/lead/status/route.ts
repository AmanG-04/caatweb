import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getEnv } from "@/lib/cloudflare";
const schema=z.object({leadId:z.string().min(1),status:z.enum(["new","called","site_visit","proposal_sent","won","lost"])});
export async function PATCH(request: Request) { const admin=await requireAdmin(request); if(!admin)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Admin login required."}},{status:401}); const parsed=schema.safeParse(await request.json()); if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid lead status."}},{status:400}); const db=getEnv().DB; if(db)await db.prepare("UPDATE leads SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(parsed.data.status,parsed.data.leadId).run(); return NextResponse.json({success:true,data:parsed.data}); }
